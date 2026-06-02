<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'role' => 'required|in:etudiant,entreprise', 
            'filiere' => 'required_if:role,etudiant|string|nullable',
            'niveau_etude' => 'required_if:role,etudiant|string|nullable',
            'description' => 'required_if:role,entreprise|string|nullable',
            'site_web' => 'nullable|url',
        ];
    }
}
