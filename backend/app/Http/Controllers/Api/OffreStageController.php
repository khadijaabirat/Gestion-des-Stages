<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OffreStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreOffreStageRequest;
use App\Http\Requests\UpdateOffreStageRequest;
use App\Http\Resources\OffreStageResource;
use App\Http\Resources\CandidatureResource;
use Illuminate\Support\Facades\DB;
 
class OffreStageController extends Controller
{ 
    public function index(Request $request)
    {
        $query = OffreStage::with('entreprise:id,nom,description,site_web,photo')
            ->published()
            ->activeEntreprise();

      if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('titre', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('entreprise', function($q2) use ($request) {
                      $q2->where('nom', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->filled('localisation')) {
            $query->where('localisation', 'like', '%' . $request->localisation . '%');
        }

        if ($request->filled('duree')) {
            $query->where('duree', $request->duree);
        }

        $offres = $query->orderBy('created_at', 'desc')->paginate(10);

        return OffreStageResource::collection($offres)->additional([
            'message' => 'Liste des offres de stage'
        ]);
    }
 
    public function mesOffres()
    {
        $user = Auth::user();

        if ($user->role !== 'entreprise') {
            return response()->json(['message' => 'Action réservée aux entreprises.'], 403);
        }

        $offres = OffreStage::where('user_id', $user->id)
            ->withCount('candidatures')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return OffreStageResource::collection($offres);
    }
 
    public function store(StoreOffreStageRequest $request)
    {
        $this->authorize('create', OffreStage::class);
        
        $offre = OffreStage::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
            'statut' => $request->statut ?? 'draft'
        ]));

        return (new OffreStageResource($offre))->additional([
            'message' => 'Offre créée avec succès'
        ])->response()->setStatusCode(201);
    }
 
 public function show(string $id)
    {
        $offre = OffreStage::with('entreprise:id,nom,description,site_web,photo,est_valide,is_blocked')->find($id);

        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }

        $this->authorize('view', $offre);

        return (new OffreStageResource($offre))->additional([
            'message' => 'Détails de l\'offre'
        ]);
    }

 
public function update(UpdateOffreStageRequest $request, string $id)
{
    $offre = OffreStage::find($id);
    
    if (!$offre) {
        return response()->json(['message' => 'Offre introuvable'], 404);
    }

    $this->authorize('update', $offre);

    $offre->update($request->validated());

    return (new OffreStageResource($offre))->additional([
        'message' => 'Offre mise à jour'
    ]);
}
 
    public function destroy(string $id)
    {
        $offre = OffreStage::find($id);

        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }
        
        $this->authorize('delete', $offre);

        $offre->delete();

        return response()->json([
            'message' => 'Offre supprimée avec succès'
        ], 200);
    }

    /**
     * Get aggregated stats for the entreprise dashboard
     */
    public function entrepriseStats()
    {
        $user = Auth::user();

        $offreIds = OffreStage::where('user_id', $user->id)->pluck('id');

        $offresStats = OffreStage::where('user_id', $user->id)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'published' THEN 1 ELSE 0 END) as publiees,
                SUM(CASE WHEN statut = 'draft' THEN 1 ELSE 0 END) as brouillon
            ")
            ->first();

        $totalOffres = (int) ($offresStats->total ?? 0);
        $offresPubliees = (int) ($offresStats->publiees ?? 0);
        $offresBrouillon = (int) ($offresStats->brouillon ?? 0);

        $candidaturesStats = \App\Models\Candidature::whereIn('offre_stage_id', $offreIds)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = 'accepte' THEN 1 ELSE 0 END) as acceptees,
                SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) as refusees
            ")
            ->first();

        $totalCandidatures = (int) ($candidaturesStats->total ?? 0);
        $candidaturesEnAttente = (int) ($candidaturesStats->en_attente ?? 0);
        $candidaturesAcceptees = (int) ($candidaturesStats->acceptees ?? 0);
        $candidaturesRefusees = (int) ($candidaturesStats->refusees ?? 0);

        // Recent candidatures (last 5)
        $recentCandidatures = \App\Models\Candidature::with(['etudiant:id,nom,email,filiere', 'offreStage:id,titre'])
            ->whereIn('offre_stage_id', $offreIds)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Offres with candidature count
        $offresWithCount = OffreStage::where('user_id', $user->id)
            ->withCount('candidatures')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'total_offres' => $totalOffres,
                'offres_publiees' => $offresPubliees,
                'offres_brouillon' => $offresBrouillon,
                'total_candidatures' => $totalCandidatures,
                'candidatures_en_attente' => $candidaturesEnAttente,
                'candidatures_acceptees' => $candidaturesAcceptees,
                'candidatures_refusees' => $candidaturesRefusees,
                'recent_candidatures' => CandidatureResource::collection($recentCandidatures),
                'recent_offres' => OffreStageResource::collection($offresWithCount),
                'est_valide' => $user->est_valide,
            ]
        ], 200);
    }
}
