<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Recherche d'utilisateurs (Entreprises, Étudiants, etc.)
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        $role = $request->input('role'); // Optionnel, pour filtrer par rôle

        $usersQuery = User::where('id', '!=', Auth::id())
            ->where('is_blocked', false); // Ne pas afficher les bloqués

        if ($query) {
            $usersQuery->where('nom', 'like', '%' . $query . '%');
        }

        if ($role) {
            $usersQuery->where('role', $role);
        } else {
            // Par défaut, un étudiant cherche des entreprises et vice-versa, mais on peut tout retourner
            $usersQuery->whereIn('role', ['etudiant', 'entreprise']);
        }

        // On exclut les entreprises non validées
        $usersQuery->where(function($q) {
            $q->where('role', '!=', 'entreprise')
              ->orWhere('est_valide', true);
        });

        $users = $usersQuery->select('id', 'nom', 'role', 'filiere', 'description', 'adresse', 'photo')
            ->take(10)
            ->get();

        return response()->json([
            'message' => 'Résultats de recherche',
            'data' => $users
        ]);
    }

    /**
     * Afficher le profil public d'un utilisateur
     */
    public function showPublicProfile($id)
    {
        $user = User::with(['skills', 'experiences', 'offresStages' => function ($q) {
            $q->where('statut', 'published'); // Seulement les offres publiées
        }])->find($id);

        if (!$user || $user->is_blocked || ($user->role === 'entreprise' && !$user->est_valide)) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        // Cacher les données sensibles pour le profil public
        $user->makeHidden(['email', 'created_at', 'updated_at', 'est_valide', 'is_blocked', 'email_verified_at']);

        return response()->json([
            'message' => 'Profil utilisateur',
            'data' => $user
        ]);
    }
}
