<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OffreStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreOffreStageRequest;
use App\Http\Requests\UpdateOffreStageRequest;
 
class OffreStageController extends Controller
{ 
    public function index(Request $request)
    {
        $query = OffreStage::with('entreprise:id,nom,description,site_web')
            ->where('statut', 'published')
            ->whereHas('entreprise', function($q) {
                    $q->where('is_blocked', false)
                      ->where('est_valide', true);
                });

      if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('titre', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('localisation')) {
            $query->where('localisation', $request->localisation);
        }

        if ($request->filled('duree')) {
            $query->where('duree', $request->duree);
        }

        $offres = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'message' => 'Liste des offres de stage',
            'data' => $offres
        ], 200);
    }
 
    public function mesOffres()
    {
        $user = Auth::user();

        if ($user->role !== 'entreprise') {
            return response()->json(['message' => 'Action réservée aux entreprises.'], 403);
        }

        $offres = OffreStage::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['data' => $offres], 200);
    }
 
    public function store(StoreOffreStageRequest $request)
    {
        if (Auth::user()->role === 'entreprise' && !Auth::user()->est_valide) {
            return response()->json(['message' => 'Votre compte entreprise est en attente de validation par l\'admin.'], 403);
        }
        $offre = OffreStage::create(array_merge($request->validated(), [
            'user_id' => Auth::id(),
            'statut' => $request->statut ?? 'draft'
        ]));

        return response()->json(['message' => 'Offre créée avec succès', 'data' => $offre], 201);
    }
 
 public function show(string $id)
    {
        $offre = OffreStage::with('entreprise:id,nom,description,site_web')->find($id);

        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }

        $user = Auth::user();
        
$isPublished = $offre->statut === 'published' && $offre->entreprise?->est_valide && !$offre->entreprise?->is_blocked;
        $isOwner = $user && $user->id === $offre->user_id;
        $isAdmin = $user && $user->role === 'admin';

         if (!$isPublished && !$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Accès refusé ou offre indisponible'], 403);
        }

        return response()->json([
            'message' => 'Détails de l\'offre',
            'data' => $offre
        ], 200);
    }

 
public function update(UpdateOffreStageRequest $request, string $id)
{
     if (Auth::user()->role === 'entreprise' && !Auth::user()->est_valide) {
        return response()->json(['message' => 'Votre compte n\'est pas validé. Vous ne pouvez pas modifier d\'offres.'], 403);
    }

    $offre = OffreStage::find($id);
    
    if (!$offre) {
        return response()->json(['message' => 'Offre introuvable'], 404);
    }

    if ($offre->user_id !== Auth::id()) {
        return response()->json(['message' => 'Accès refusé. Vous ne pouvez modifier que vos propres offres.'], 403);
    }

    $offre->update($request->validated());

    return response()->json(['message' => 'Offre mise à jour', 'data' => $offre], 200);
}
 
    public function destroy(string $id)
    {
        $offre = OffreStage::find($id);

        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }
        $user = Auth::user();
       if ($offre->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $offre->delete();

        return response()->json([
            'message' => 'Offre supprimée avec succès'
        ], 200);
    }
}
