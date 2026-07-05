<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OffreStageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'titre' => $this->titre,
            'description' => $this->description,
            'date_debut' => $this->date_debut,
            'date_expiration' => $this->date_expiration,
            'duree' => $this->duree,
            'statut' => $this->statut,
            'localisation' => $this->localisation,
            'created_at' => $this->created_at,
            'candidatures_count' => $this->whenCounted('candidatures'),
            'entreprise' => $this->whenLoaded('entreprise', function () {
                return [
                    'id' => $this->entreprise->id,
                    'nom' => $this->entreprise->nom,
                    'description' => $this->entreprise->description,
                    'site_web' => $this->entreprise->site_web,
                    'photo' => $this->entreprise->photo,
                    'est_valide' => $this->entreprise->est_valide,
                    'is_blocked' => $this->entreprise->is_blocked,
                ];
            }),
        ];
    }
}
