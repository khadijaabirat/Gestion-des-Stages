<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Models\OffreStage;
use Illuminate\Support\Facades\Auth;
class UpdateOffreStageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
       $offreId = $this->route('id'); 
        $offre = OffreStage::find($offreId);
if (!$offre) {
            abort(404, 'Offre de stage introuvable.');
        }
return $this->user() && ($offre->user_id === $this->user()->id || $this->user()->role == 'admin' );    
}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'date_debut' => 'sometimes|required|date',
            'date_expiration' => 'sometimes|required_with:date_debut|date|after:date_debut',
            'duree' => 'sometimes|required|integer|min:1|max:12',
            'localisation' => 'sometimes|required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'statut' => 'sometimes|required|in:draft,published,closed,expired'
             ];
    }
}
