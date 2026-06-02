<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Skill;
use App\Models\OffreStage;
use App\Models\Candidature;
 
class AdminController extends Controller
{
    
    public function listUsers(Request $request)
    {
        $query = User::where('role', '!=', 'admin');

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return response()->json([
            'data' => $query->orderBy('created_at', 'desc')->paginate(10)
            ], 200);
    }

    public function listSkills()
    {
        $skills = Skill::orderBy('nom')->get();
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
        
    // RÉFÉRENTIEL DES SKILLS (Bulle: Gérer le Référentiel)
  
      public function storeSkill(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255|unique:skills,nom'
            ]);
            
            $skill = Skill::create([
                'nom' => $request->nom
        ]);

        return response()->json([
            'message' => 'Compétence ajoutée au référentiel avec succès.',
            'data' => $skill
            ], 201);
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
 
}
