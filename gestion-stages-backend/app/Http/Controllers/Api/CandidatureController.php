<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Candidature;
use App\Models\OffreStage;
use App\Models\Cv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CandidatureNotification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
class CandidatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'etudiant') {
            $candidatures = Candidature::with(['offreStage.entreprise:id,nom', 'cv'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
                
        } elseif ($user->role === 'entreprise') {
            $candidatures = Candidature::with(['etudiant:id,nom,email,telephone', 'cv', 'offreStage:id,titre'])
                ->whereHas('offreStage', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            $candidatures = Candidature::with(['etudiant:id,nom', 'offreStage:id,titre', 'cv'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }

        return response()->json([
            'message' => 'Liste des candidatures',
            'data' => $candidatures
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Seuls les étudiants peuvent postuler.'], 403);
        }

         $validatedData = $request->validate([
            'offre_stage_id' => 'required|exists:offre_stages,id',
            'cv_id' => 'required|exists:cvs,id',
            'lettre_motivation' => 'nullable|string',
        ]);
 
$offre = OffreStage::with('entreprise')->findOrFail($validatedData['offre_stage_id']);

if (!$offre->entreprise || $offre->statut !== 'published' || $offre->entreprise->is_blocked || !$offre->entreprise->est_valide ) {
            return response()->json(['message' => 'Cette offre n\'est plus disponible ou l\'entreprise est suspendue.'], 400);
        }

         $dejaPostule = Candidature::where('user_id', $user->id)
            ->where('offre_stage_id', $offre->id)
            ->exists();
            
        if ($dejaPostule) {
            return response()->json(['message' => 'Vous avez déjà postulé à cette offre.'], 400);
        }


         $cv = Cv::where('id', $validatedData['cv_id'])
         ->where('user_id', $user->id)
         ->first();
       if (!$cv || !Storage::disk('public')->exists($cv->file_path)) {
            return response()->json(['message' => 'Ce CV ne vous appartient pas ou le fichier est introuvable.'], 404);
        }
       $originalPath = $cv->file_path;
        $extension = pathinfo($originalPath, PATHINFO_EXTENSION);
        $snapshotPath = 'cvs/snapshots/snapshot_' . uniqid() . '_' . time() . '.' . $extension;
         
      $candidature = DB::transaction(function () use ($user, $offre, $cv, $validatedData, $originalPath, $snapshotPath) {
            
             $candid = Candidature::create([
                'user_id' => $user->id,
                'offre_stage_id' => $offre->id,
                'cv_id' => $cv->id,
                'cv_file_snapshot' => $snapshotPath,  
                'lettre_motivation' => $validatedData['lettre_motivation'] ?? null,
                'statut' => 'en_attente'  
            ]);

           $copied = Storage::disk('public')->copy($originalPath, $snapshotPath);

             if (!$copied) {
                throw new \Exception("Erreur lors de la copie du fichier CV.");
            }

            return $candid;
        });
 
try {
            $entreprise = $offre->entreprise; 
            $candidatureComplete = Candidature::with(['etudiant', 'offreStage.entreprise'])->find($candidature->id);
            $entreprise->notify(new CandidatureNotification($candidatureComplete, 'creation'));
        } catch (\Exception $e) {
           Log::error($e->getMessage()) ;
        }
        return response()->json([
            'message' => 'Candidature envoyée avec succès',
            'data' => $candidature
        ], 201);
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage', 'cv'])->find($id);
        
        if (!$candidature) {
            return response()->json(['message' => 'Candidature introuvable'], 404);
        }

        $user = Auth::user();
        
        $isOwner = $user->id === $candidature->user_id;
        $isEntreprise = $user->id === $candidature->offreStage?->user_id;
        
        if (!$isOwner && !$isEntreprise && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return response()->json(['data' => $candidature], 200);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage', 'cv'])->find($id);
        
        if (!$candidature) {
            return response()->json(['message' => 'Candidature introuvable'], 404);
        }

        $user = Auth::user();

         if ($user->role === 'etudiant' && $candidature->user_id === $user->id) {
            $request->validate(['statut' => 'required|in:annule']);
            
            if ($candidature->statut !== 'en_attente') {
                return response()->json(['message' => 'Vous ne pouvez annuler qu\'une candidature en attente.'], 400);
            }
            
            $candidature->update(['statut' => 'annule']);
            return response()->json(['message' => 'Candidature annulée avec succès', 'data' => $candidature], 200);
        }

        if ($user->role === 'entreprise' && $candidature->offreStage?->user_id === $user->id) {            
            if (in_array($candidature->statut, ['accepte', 'refuse'])) {
                return response()->json(['message' => 'Cette candidature a déjà été traitée et ne peut plus être modifiée.'], 400);
            }
            
            if ($candidature->statut === 'annule') {
                return response()->json(['message' => 'L\'étudiant a déjà annulé sa candidature.'], 400);
            }

            $request->validate(['statut' => 'required|in:accepte,refuse']);
            $candidature->update(['statut' => $request->statut]);
            
            try { 
                $etudiant = $candidature->etudiant;
                $candidatureComplete = Candidature::with(['offreStage.entreprise'])->find($candidature->id);
                $etudiant->notify(new CandidatureNotification($candidatureComplete, $request->statut));
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
            
            return response()->json(['message' => 'Statut de la candidature mis à jour', 'data' => $candidature], 200);
        }

        return response()->json(['message' => 'Accès non autorisé pour cette action.'], 403);
    }



    /**
     * Remove the specified resource from storage.
     */
public function destroy(string $id)
    {
        $candidature = Candidature::find($id);

        if (!$candidature) {
            return response()->json(['message' => 'Candidature introuvable'], 404);
        }

        $user = Auth::user();

         if ($candidature->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

         if ($user->role === 'etudiant' && in_array($candidature->statut, ['accepte', 'refuse'])) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer une candidature qui a déjà été traitée par l\'entreprise.'
            ], 400);
        }

        $snapshotPath = $candidature->cv_file_snapshot;

        $candidature->delete();

         if ($snapshotPath && Storage::disk('public')->exists($snapshotPath)) {
            Storage::disk('public')->delete($snapshotPath);
        }
        
        return response()->json(['message' => 'Candidature supprimée avec succès'], 200);
    }



 /**
 * Consulter les candidatures reçues pour une offre spécifique (Pour l'Entreprise)
 */
public function getByOffre($offreId)
{
    $user = Auth::user();

    if ($user->role !== 'entreprise') {
        return response()->json(['message' => 'Accès refusé.'], 403);
    }

     $offre = OffreStage::where('id', $offreId)->where('user_id', $user->id)->first();
    if (!$offre) {
        return response()->json(['message' => 'Offre introuvable ou vous n\'êtes pas le propriétaire.'], 404);
    }

    $candidatures = Candidature::with('etudiant:id,nom,email,telephone,filiere', 'cv')
        ->where('offre_stage_id', $offreId)
        ->paginate(10);

    return response()->json(['data' => $candidatures], 200);
}



/**
 * Télécharger le fichier PDF du CV snapshot (Pour l'Entreprise )
 */
    public function downloadCvSnapshot($id)
    {
        $candidature = Candidature::with(['etudiant', 'offreStage', 'cv'])->find($id);
        
        if (!$candidature) {
            return response()->json(['message' => 'Candidature introuvable'], 404);
        }

        $user = Auth::user();
        
        if ($user->id !== $candidature->user_id && $user->id !== $candidature->offreStage?->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $filePath = $candidature->cv_file_snapshot;

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Fichier PDF introuvable sur le serveur.'], 404);
        }

        $nomEtudiant = Str::slug($candidature->etudiant->nom, '_');
        $nomFichier = 'CV_' . $nomEtudiant . '_Offre_' . $candidature->offre_stage_id . '.pdf';
        
        return Storage::disk('public')->download($filePath, $nomFichier);
    }

}
  