<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidatureResource extends JsonResource
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
            'offre_stage_id' => $this->offre_stage_id,
            'cv_id' => $this->cv_id,
            'cv_file_snapshot' => $this->cv_file_snapshot,
            'lettre_motivation' => $this->lettre_motivation,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'offreStage' => new OffreStageResource($this->whenLoaded('offreStage')),
            'etudiant' => $this->whenLoaded('etudiant', function () {
                return [
                    'id' => $this->etudiant->id,
                    'nom' => $this->etudiant->nom,
                    'email' => $this->etudiant->email,
                    'telephone' => $this->etudiant->telephone,
                    'filiere' => $this->etudiant->filiere,
                    'photo' => $this->etudiant->photo,
                    'niveau_etude' => $this->etudiant->niveau_etude,
                    'bio' => $this->etudiant->bio,
                ];
            }),
            'cv' => $this->whenLoaded('cv'),
        ];
    }
}
