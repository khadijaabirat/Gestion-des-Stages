<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Skill;
use App\Models\OffreStage;
use App\Models\Candidature;
use App\Notifications\EntrepriseValidatedNotification;
 
class AdminController extends Controller
{
    
    public function listUsers(Request $request)
    {
        $query = User::where('role', '!=', 'admin');

        if ($request->has('role') && $request->role !== '') {
            $query->where('role', $request->role);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== '') {
            if ($request->status === 'Banni') {
                $query->where('is_blocked', true);
            } elseif ($request->status === 'En attente') {
                $query->where('role', 'entreprise')->where('est_valide', false);
            } elseif ($request->status === 'Actif') {
                $query->where('is_blocked', false)
                      ->where(function($q) {
                          $q->where('role', '!=', 'entreprise')
                            ->orWhere('est_valide', true);
                      });
            }
        }

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->paginate(10)
            ], 200);
    }

    public function listSkills()
    {
        $skills = Skill::withCount('etudiants')->orderBy('nom', 'asc')->get();
        return response()->json(['data' => $skills], 200);
    }
    
    /**
     * Bannir ou Débannir un utilisateur 
     */
    public function toggleBlockUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de bloquer un administrateur.'], 400);
            }
            
            $user->is_blocked = !$user->is_blocked;
            $user->save();
            
             if ($user->is_blocked) {
            $user->tokens()->delete();
            }

            if ($user->is_blocked) {
            $status = 'suspendu';
            } else {
            $status = 'activé';
            }
            
            return response()->json([
                'message' => "Le compte de l'utilisateur a été $status avec succès.",
            'data' => $user
            ], 200);
    }

    /**
     * Valider ou Rejeter le compte d'une Entreprise 
    */
    public function validateEntreprise(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approuver,rejeter'
        ]);

        $entreprise = User::where('id', $id)->where('role', 'entreprise')->first();

        if (!$entreprise) {
            return response()->json(['message' => 'Entreprise introuvable.'], 404);
            }

        if ($request->action === 'approuver') {
            $entreprise->update(['est_valide' => true]);
            $entreprise->notify(new EntrepriseValidatedNotification());
            
            // Notification WhatsApp à l'entreprise
            if ($entreprise->telephone) {
                $waService = new \App\Services\WhatsAppService();
                $waService->notifyAccountValidated($entreprise->telephone, $entreprise->nom);
            }

            $message = "L'entreprise a été approuvée. Elle peut maintenant publier des offres.";
        } else {
            $entreprise->delete();
            $message = "Le compte de l'entreprise a été rejeté et supprimé.";
            }

            return response()->json([
                'message' => $message,
                'data' => $request->action === 'approuver' ? $entreprise : null
            ], 200);
        }

       // GESTION DES OFFRES DE STAGE  
      public function listAllOffres()
    {
       $offres = OffreStage::withTrashed()
            ->with('entreprise:id,nom,email')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['data' => $offres], 200);
    }

    public function deleteOffre($id)
    {
        $offre = OffreStage::find($id);
        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable.'], 404);
        }
        $offre->delete();
        return response()->json(['message' => 'L\'offre a été supprimée avec succès.'], 200);
    }

    public function updateOfferStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:published,draft,rejected'
        ]);

        $offre = OffreStage::find($id);
        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable.'], 404);
        }

        $offre->statut = $request->status;
        $offre->save();

        return response()->json([
            'message' => 'Le statut de l\'offre a été mis à jour.',
            'data' => $offre
        ], 200);
    }
        
    // RÉFÉRENTIEL DES SKILLS (Bulle: Gérer le Référentiel)

      public function storeSkill(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255|unique:skills,nom',
            'category' => 'nullable|string',
            'level' => 'nullable|string',
            'tags' => 'nullable|array'
        ]);
            
        $skill = Skill::create([
            'nom' => $request->nom,
            'category' => $request->category ?? 'Développement',
            'level' => $request->level ?? 'Intermédiaire',
            'tags' => $request->tags ?? []
        ]);

        return response()->json([
            'message' => 'Compétence ajoutée au référentiel avec succès.',
            'data' => $skill
        ], 201);
    }
            
    public function updateSkill(Request $request, $id)
    {
        $skill = Skill::find($id);
        if (!$skill) {
            return response()->json(['message' => 'Compétence introuvable.'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255|unique:skills,nom,' . $skill->id,
            'category' => 'nullable|string',
            'level' => 'nullable|string',
            'tags' => 'nullable|array'
        ]);

        if ($request->has('nom')) $skill->nom = $request->nom;
        if ($request->has('category')) $skill->category = $request->category;
        if ($request->has('level')) $skill->level = $request->level;
        if ($request->has('tags')) $skill->tags = $request->tags;

        $skill->save();

        return response()->json([
            'message' => 'Compétence modifiée avec succès.',
            'data' => $skill
        ], 200);
    }

    public function mergeSkills(Request $request)
    {
        $request->validate([
            'main_skill_id' => 'required|exists:skills,id',
            'duplicate_ids' => 'required|array',
            'duplicate_ids.*' => 'exists:skills,id'
        ]);

        $mainSkill = Skill::find($request->main_skill_id);
        $duplicates = Skill::whereIn('id', $request->duplicate_ids)->where('id', '!=', $mainSkill->id)->get();

        if ($duplicates->isEmpty()) {
            return response()->json(['message' => 'Aucun doublon valide à fusionner.'], 400);
        }

        $userIdsToAttach = [];

        foreach ($duplicates as $duplicate) {
            // Get all user IDs attached to this duplicate
            $userIds = $duplicate->etudiants()->pluck('user_id')->toArray();
            $userIdsToAttach = array_merge($userIdsToAttach, $userIds);
        }

        // Attach all users to the main skill without detaching existing ones, and avoiding duplicates
        if (!empty($userIdsToAttach)) {
            $mainSkill->etudiants()->syncWithoutDetaching(array_unique($userIdsToAttach));
        }

        // Delete the duplicates
        foreach ($duplicates as $duplicate) {
            $duplicate->etudiants()->detach();
            $duplicate->delete();
        }

        return response()->json([
            'message' => 'Compétences fusionnées avec succès.'
        ], 200);
    }

            /**
             * Supprimer un Skill du Référentiel
            */
            public function destroySkill($id)
            {
        $skill = Skill::find($id);

        if (!$skill) {
            return response()->json(['message' => 'Compétence introuvable.'], 404);
            }
            
             $skill->delete();

            return response()->json(['message' => 'Compétence supprimée du référentiel.'], 200);
    }

   //STATISTIQUES  
    public function getStats()
    {
        return response()->json([
            'data' => [
                'total_etudiants' => User::where('role', 'etudiant')->count(),
                'total_entreprises' => User::where('role', 'entreprise')->count(),
                'entreprises_en_attente' => User::where('role', 'entreprise')->where('est_valide', false)->count(),
                'total_offres' => OffreStage::count(),
                'offres_publiees' => OffreStage::where('statut', 'published')->count(),
                'total_candidatures' => Candidature::count(),
                'candidatures_acceptees' => Candidature::where('statut', 'accepte')->count(),
                ]
        ], 200);
    }
 
    /**
     * List soft-deleted users
     */
    public function listTrashedUsers(Request $request)
    {
        $query = User::onlyTrashed()->where('role', '!=', 'admin');

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->orderBy('deleted_at', 'desc')->paginate(10)
        ], 200);
    }

    /**
     * Show user details with their history
     */
    public function showUserDetails($id)
    {
        $user = User::withTrashed()->with(['candidatures.offreStage', 'offresStages', 'skills'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json(['data' => $user], 200);
    }

    /**
     * Restore a soft-deleted user
     */
    public function restoreUser($id)
    {
        $user = User::onlyTrashed()->find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable dans la corbeille.'], 404);
        }

        $user->restore();

        return response()->json([
            'message' => "Le compte de {$user->nom} a été restauré avec succès.",
            'data' => $user
        ], 200);
    }

    /**
     * Soft-delete a user (archive)
     */
    public function softDeleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 400);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => "Le compte de {$user->nom} a été archivé.",
        ], 200);
    }
}
