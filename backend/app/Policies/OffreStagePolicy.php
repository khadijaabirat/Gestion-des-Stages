<?php

namespace App\Policies;

use App\Models\OffreStage;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OffreStagePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, OffreStage $offreStage): Response
    {
        $isPublished = ($offreStage->statut === \App\Enums\OffreStatus::PUBLISHED || $offreStage->statut === 'published') && 
                       $offreStage->entreprise?->est_valide && 
                       !$offreStage->entreprise?->is_blocked;

        if ($isPublished) {
            return Response::allow();
        }

        if ($user && ($user->id === $offreStage->user_id || $user->role === 'admin')) {
            return Response::allow();
        }

        return Response::deny('Accès refusé ou offre indisponible', 403);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): Response
    {
        if ($user->role === 'entreprise' && !$user->est_valide) {
            return Response::deny('Votre compte entreprise est en attente de validation par l\'admin.', 403);
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OffreStage $offreStage): Response
    {
        if ($user->role === 'entreprise' && !$user->est_valide) {
            return Response::deny('Votre compte n\'est pas validé. Vous ne pouvez pas modifier d\'offres.', 403);
        }

        if ($user->id !== $offreStage->user_id && $user->role !== 'admin') {
            return Response::deny('Accès refusé. Vous ne pouvez modifier que vos propres offres.', 403);
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OffreStage $offreStage): Response
    {
        if ($user->id !== $offreStage->user_id && $user->role !== 'admin') {
            return Response::deny('Accès refusé.', 403);
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can view candidatures for the model.
     */
    public function viewCandidatures(User $user, OffreStage $offreStage): Response
    {
        if ($user->role !== 'entreprise') {
            return Response::deny('Accès refusé.', 403);
        }

        if ($user->id !== $offreStage->user_id) {
            return Response::deny('Offre introuvable ou vous n\'êtes pas le propriétaire.', 403);
        }

        return Response::allow();
    }
}
