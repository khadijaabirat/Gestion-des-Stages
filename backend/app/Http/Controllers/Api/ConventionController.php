<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidature;
use App\Services\ConventionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConventionController extends Controller
{
    public function __construct(private ConventionService $conventionService) {}

    /**
     * Generate the convention PDF for an accepted candidature.
     * Only the entreprise that owns the offer can trigger this.
     */
    public function generate(string $candidatureId)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage.entreprise'])->findOrFail($candidatureId);

        $user = Auth::user();

        if ($user->role !== 'entreprise' || $candidature->offreStage->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $statusValue = $candidature->statut instanceof \App\Enums\CandidatureStatus ? $candidature->statut->value : $candidature->statut;
        if ($statusValue !== 'accepte') {
            return response()->json(['message' => 'La convention ne peut être générée que pour une candidature acceptée.'], 400);
        }

        if ($candidature->convention_statut !== 'non_generee') {
            return response()->json(['message' => 'La convention a déjà été générée.'], 400);
        }

        $pdfPath = $this->conventionService->generatePdf($candidature);

        $candidature->update([
            'convention_pdf_path' => $pdfPath,
            'convention_statut'   => 'generee',
        ]);

        return response()->json([
            'message'          => 'Convention générée avec succès.',
            'convention_statut' => 'generee',
            'pdf_url'          => Storage::disk('public')->url($pdfPath),
        ]);
    }

    /**
     * Send the convention to Yousign for electronic signature.
     * Only the entreprise can initiate this after PDF generation.
     */
    public function sendForSignature(string $candidatureId)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage.entreprise'])->findOrFail($candidatureId);

        $user = Auth::user();

        if ($user->role !== 'entreprise' || $candidature->offreStage->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if ($candidature->convention_statut !== 'generee') {
            return response()->json(['message' => 'Veuillez d\'abord générer la convention PDF.'], 400);
        }

        if (empty($this->conventionService->yousignApiKey ?? config('services.yousign.api_key'))) {
            return response()->json(['message' => 'Service de signature électronique non configuré.'], 503);
        }

        $result = $this->conventionService->createSignatureProcedure($candidature);

        $candidature->update([
            'yousign_procedure_id'             => $result['procedure_id'],
            'yousign_signature_link_etudiant'  => $result['link_etudiant'],
            'yousign_signature_link_entreprise' => $result['link_entreprise'],
            'convention_statut'                => 'en_signature',
        ]);

        return response()->json([
            'message'                          => 'Convention envoyée pour signature électronique.',
            'convention_statut'                => 'en_signature',
            'signature_link_etudiant'          => $result['link_etudiant'],
            'signature_link_entreprise'        => $result['link_entreprise'],
        ]);
    }

    /**
     * Download the convention PDF.
     * Accessible by the student, the entreprise, or an admin.
     */
    public function download(string $candidatureId)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage'])->findOrFail($candidatureId);

        $user = Auth::user();

        $isStudent    = $user->id === $candidature->user_id;
        $isEntreprise = $user->id === $candidature->offreStage?->user_id;

        if (!$isStudent && !$isEntreprise && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if (!$candidature->convention_pdf_path || !Storage::disk('public')->exists($candidature->convention_pdf_path)) {
            return response()->json(['message' => 'Convention PDF introuvable. Veuillez la générer d\'abord.'], 404);
        }

        $filename = 'Convention_Stage_' . Str::slug($candidature->etudiant->nom) . '_' . $candidature->id . '.pdf';

        return Storage::disk('public')->download($candidature->convention_pdf_path, $filename);
    }

    /**
     * Get the convention status and signature links for a candidature.
     */
    public function status(string $candidatureId)
    {
        $candidature = Candidature::findOrFail($candidatureId);

        $user = Auth::user();

        $isStudent    = $user->id === $candidature->user_id;
        $isEntreprise = $user->id === $candidature->offreStage?->user_id;

        if (!$isStudent && !$isEntreprise && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $data = [
            'convention_statut'   => $candidature->convention_statut,
            'convention_signed_at' => $candidature->convention_signed_at,
        ];

        if ($candidature->convention_pdf_path && Storage::disk('public')->exists($candidature->convention_pdf_path)) {
            $data['pdf_url'] = Storage::disk('public')->url($candidature->convention_pdf_path);
        }

        if ($isStudent) {
            $link = $candidature->yousign_signature_link_etudiant;
            if (!$link && $candidature->convention_statut === 'en_signature' && $candidature->yousign_procedure_id) {
                $link = $this->conventionService->fetchSignerLink($candidature->yousign_procedure_id, 0);
                if ($link) {
                    $candidature->update(['yousign_signature_link_etudiant' => $link]);
                }
            }
            if ($link) $data['signature_link'] = $link;
        }

        if ($isEntreprise) {
            $link = $candidature->yousign_signature_link_entreprise;
            if (!$link && $candidature->convention_statut === 'en_signature' && $candidature->yousign_procedure_id) {
                $link = $this->conventionService->fetchSignerLink($candidature->yousign_procedure_id, 1);
                if ($link) {
                    $candidature->update(['yousign_signature_link_entreprise' => $link]);
                }
            }
            if ($link) $data['signature_link'] = $link;
        }

        return response()->json($data);
    }

    /**
     * Yousign webhook — called when all parties have signed.
     */
    public function webhook(Request $request)
    {
        $event = $request->input('event_name');

        if ($event !== 'signature_request.done') {
            return response()->json(['ok' => true]);
        }

        $externalId = $request->input('data.signature_request.external_id');

        if (!$externalId || !str_starts_with($externalId, 'candidature_')) {
            return response()->json(['ok' => true]);
        }

        $candidatureId = (int) str_replace('candidature_', '', $externalId);
        $candidature   = Candidature::find($candidatureId);

        if ($candidature) {
            $candidature->update([
                'convention_statut'    => 'signee',
                'convention_signed_at' => now(),
            ]);

            Log::info("Convention signée pour candidature #{$candidatureId}");
        }

        return response()->json(['ok' => true]);
    }
}
