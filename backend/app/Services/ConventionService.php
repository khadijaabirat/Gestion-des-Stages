<?php

namespace App\Services;

use App\Models\Candidature;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConventionService
{
    private string $yousignBaseUrl;
    private string $yousignApiKey;

    public function __construct()
    {
        $this->yousignBaseUrl = config('services.yousign.base_url', 'https://api-sandbox.yousign.app/v3');
        $this->yousignApiKey  = config('services.yousign.api_key', '');
    }

    /**
     * Generate the convention PDF and persist it to storage.
     */
    public function generatePdf(Candidature $candidature): string
    {
        $candidature->loadMissing(['etudiant', 'offreStage.entreprise']);

        $pdf = Pdf::loadView('pdf.convention', [
            'candidature' => $candidature,
            'etudiant'    => $candidature->etudiant,
            'offre'       => $candidature->offreStage,
            'entreprise'  => $candidature->offreStage->entreprise,
        ])->setPaper('a4', 'portrait');

        $filename = 'conventions/convention_' . $candidature->id . '_' . Str::random(8) . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        return $filename;
    }

    /**
     * Send the PDF to Yousign and create a signature procedure.
     * Returns ['procedure_id', 'link_etudiant', 'link_entreprise']
     */
    public function createSignatureProcedure(Candidature $candidature): array
    {
        $candidature->loadMissing(['etudiant', 'offreStage.entreprise']);

        $pdfContent = Storage::disk('public')->get($candidature->convention_pdf_path);
        $pdfBase64  = base64_encode($pdfContent);

        // 1. Upload the document using multipart/form-data
        $docResponse = Http::withToken($this->yousignApiKey)
            ->attach(
                'file',
                $pdfContent,
                'Convention_Stage_' . $candidature->id . '.pdf'
            )
            ->post("{$this->yousignBaseUrl}/documents", [
                'nature'  => 'signable_document',
            ]);

        if ($docResponse->failed()) {
            Log::error('Yousign document upload failed', $docResponse->json());
            throw new \RuntimeException('Yousign: échec upload document — ' . $docResponse->body());
        }

        $documentId = $docResponse->json('id');

        // 2. Create the signature request
        $etudiant   = $candidature->etudiant;
        $entreprise = $candidature->offreStage->entreprise;

        // In sandbox mode, Yousign requires emails from your organization.
        // Override with the authenticated user's email for testing.
        $sandboxMode = str_contains($this->yousignBaseUrl, 'sandbox');
        $testEmail   = config('services.yousign.test_email', $etudiant->email);

        $requestResponse = Http::withToken($this->yousignApiKey)
            ->post("{$this->yousignBaseUrl}/signature_requests", [
                'name'               => 'Convention de Stage #' . $candidature->id,
                'delivery_mode'      => 'email',
                'ordered_signers'    => false,
                'reminder_settings'  => ['interval_in_days' => 2, 'max_occurrences' => 3],
                'signers'            => [
                    [
                        'info' => [
                            'first_name' => explode(' ', $etudiant->nom)[0] ?? $etudiant->nom,
                            'last_name'  => implode(' ', array_slice(explode(' ', $etudiant->nom), 1)) ?: '-',
                            'email'      => $sandboxMode ? $testEmail : $etudiant->email,
                            'locale'     => 'fr',
                        ],
                        'signature_level'              => 'electronic_signature',
                        'signature_authentication_mode' => 'no_otp',
                        'fields' => [[
                            'document_id' => $documentId,
                            'type'        => 'signature',
                            'page'        => 1,
                            'x'           => 50,
                            'y'           => 700,
                            'width'       => 200,
                            'height'      => 50,
                        ]],
                    ],
                    [
                        'info' => [
                            'first_name' => $entreprise->nom,
                            'last_name'  => 'Entreprise',
                            'email'      => $sandboxMode ? $testEmail : $entreprise->email,
                            'locale'     => 'fr',
                        ],
                        'signature_level'              => 'electronic_signature',
                        'signature_authentication_mode' => 'no_otp',
                        'fields' => [[
                            'document_id' => $documentId,
                            'type'        => 'signature',
                            'page'        => 1,
                            'x'           => 350,
                            'y'           => 700,
                            'width'       => 200,
                            'height'      => 50,
                        ]],
                    ],
                ],
                'documents'          => [$documentId],
                'external_id'        => 'candidature_' . $candidature->id,
            ]);

        if ($requestResponse->failed()) {
            Log::error('Yousign signature request failed', $requestResponse->json());
            throw new \RuntimeException('Yousign: échec création procédure — ' . $requestResponse->body());
        }

        $procedureId = $requestResponse->json('id');
        $signers     = $requestResponse->json('signers', []);

        // 3. Activate the signature request
        $activateResponse = Http::withToken($this->yousignApiKey)
            ->post("{$this->yousignBaseUrl}/signature_requests/{$procedureId}/activate");

        Log::info('Yousign activate response', $activateResponse->json() ?? []);

        // 4. Fetch signature links per signer (only available after activation)
        $linkEtudiant   = null;
        $linkEntreprise = null;

        if (!empty($signers[0]['id'])) {
            $s = Http::withToken($this->yousignApiKey)
                ->get("{$this->yousignBaseUrl}/signature_requests/{$procedureId}/signers/{$signers[0]['id']}");
            Log::info('Yousign signer[0] response', $s->json() ?? []);
            $linkEtudiant = $s->json('signature_link');
        }

        if (!empty($signers[1]['id'])) {
            $s = Http::withToken($this->yousignApiKey)
                ->get("{$this->yousignBaseUrl}/signature_requests/{$procedureId}/signers/{$signers[1]['id']}");
            Log::info('Yousign signer[1] response', $s->json() ?? []);
            $linkEntreprise = $s->json('signature_link');
        }

        Log::info('Yousign links', ['etudiant' => $linkEtudiant, 'entreprise' => $linkEntreprise]);
        return [
            'procedure_id'    => $procedureId,
            'link_etudiant'   => $linkEtudiant,
            'link_entreprise' => $linkEntreprise,
        ];
    }

    /**
     * Fetch a signer's signature_link live from Yousign API.
     * $signerIndex: 0 = etudiant, 1 = entreprise
     */
    public function fetchSignerLink(string $procedureId, int $signerIndex): ?string
    {
        $signersRes = Http::withToken($this->yousignApiKey)
            ->get("{$this->yousignBaseUrl}/signature_requests/{$procedureId}/signers");

        if ($signersRes->failed()) {
            Log::error('Yousign fetchSignerLink: failed to list signers', $signersRes->json() ?? []);
            return null;
        }

        $signers = $signersRes->json('signers') ?? $signersRes->json() ?? [];
        // Handle both {signers: [...]} and [...] response shapes
        if (isset($signers[0]) && is_array($signers[0])) {
            $signer = $signers[$signerIndex] ?? null;
        } else {
            $signer = array_values($signers)[$signerIndex] ?? null;
        }

        if (!$signer || empty($signer['id'])) return null;

        $res = Http::withToken($this->yousignApiKey)
            ->get("{$this->yousignBaseUrl}/signature_requests/{$procedureId}/signers/{$signer['id']}");

        Log::info("Yousign fetchSignerLink[{$signerIndex}]", $res->json() ?? []);
        return $res->json('signature_link');
    }
}
