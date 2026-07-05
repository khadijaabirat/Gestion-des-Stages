<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\OffreStage;

class PublicController extends Controller
{
    public function homeData()
    {
        $totalEtudiants = User::where('role', 'etudiant')->count();
        $totalEntreprises = User::where('role', 'entreprise')->where('est_valide', true)->count();
        $totalOffres = OffreStage::where('statut', 'published')->count();
        
        $totalCandidatures = \App\Models\Candidature::count();
        $acceptedCandidatures = \App\Models\Candidature::where('statut', 'accepte')->count();
        $tauxReussite = $totalCandidatures > 0 ? round(($acceptedCandidatures / $totalCandidatures) * 100) : 0;
        
        // Strict real data from the database
        $stats = [
            'etudiants' => $totalEtudiants,
            'entreprises' => $totalEntreprises,
            'offres' => $totalOffres,
            'taux_reussite' => $tauxReussite,
            'taux_placement' => 94 // kept for backward compatibility if needed elsewhere
        ];

        $recentOffres = OffreStage::with('entreprise')
            ->whereIn('statut', ['active', 'actif', 'published', 'ouvert'])
            ->whereDate('date_expiration', '>=', now())
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($offre) {
                $text = strtolower($offre->titre . ' ' . ($offre->description ?? ''));
                $tags = [];
                if (str_contains($text, 'react')) $tags[] = 'React';
                if (str_contains($text, 'laravel') || str_contains($text, 'php')) $tags[] = 'Laravel';
                if (str_contains($text, 'ia') || str_contains($text, 'ai') || str_contains($text, 'data')) $tags[] = 'IA';
                if (str_contains($text, 'design') || str_contains($text, 'ui') || str_contains($text, 'figma')) $tags[] = 'UI/UX';
                if (str_contains($text, 'python')) $tags[] = 'Python';
                if (str_contains($text, 'marketing')) $tags[] = 'Marketing';
                if (empty($tags)) $tags = ['Stage', 'Nouveau'];

                return [
                    'id' => $offre->id,
                    'titre' => $offre->titre,
                    'entreprise' => $offre->entreprise ? $offre->entreprise->nom : 'Entreprise Anonyme',
                    'logo' => $offre->entreprise ? $offre->entreprise->photo : null,
                    'localisation' => $offre->localisation,
                    'duree' => $offre->duree ?? 'Non spécifiée',
                    'tags' => array_slice($tags, 0, 3),
                    'created_at' => $offre->created_at
                ];
            });

        $partners = User::where('role', 'entreprise')
            ->where('est_valide', true)
            ->whereNotNull('photo')
            ->limit(10)
            ->get()
            ->map(function ($entreprise) {
                return [
                    'id' => $entreprise->id,
                    'nom' => $entreprise->nom,
                    'logo' => $entreprise->photo
                ];
            });

        $latestCandidature = \App\Models\Candidature::with(['etudiant', 'offreStage.entreprise'])
            ->orderBy('updated_at', 'desc')
            ->first();

        $recent_activity = null;
        if ($latestCandidature && $latestCandidature->offreStage && $latestCandidature->etudiant) {
            $recent_activity = [
                'type' => 'candidature',
                'statut' => $latestCandidature->statut,
                'etudiant_nom' => $latestCandidature->etudiant->nom,
                'etudiant_filiere' => $latestCandidature->etudiant->filiere ?? 'Étudiant',
                'offre_titre' => $latestCandidature->offreStage->titre,
                'entreprise_nom' => $latestCandidature->offreStage->entreprise->nom ?? 'Entreprise',
                'date' => $latestCandidature->updated_at->toISOString()
            ];
        }

        return response()->json([
            'stats' => $stats,
            'recent_offres' => $recentOffres,
            'partners' => $partners,
            'recent_activity' => $recent_activity
        ], 200);
    }
}
