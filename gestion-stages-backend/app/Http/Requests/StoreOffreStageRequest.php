<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
class StoreOffreStageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
return Auth::check() && 
               Auth::user()->role === 'entreprise' && 
               Auth::user()->est_valide;   
                }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_expiration' => 'required|date|after:date_debut',
            'duree' => 'required|integer|min:1|max:12', 
            'localisation' => 'required|string|max:255',
            'statut' => 'nullable|in:draft,published,closed,expired'
        ];
    }
}
