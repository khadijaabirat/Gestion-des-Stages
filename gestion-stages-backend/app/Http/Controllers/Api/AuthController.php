<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller
{
    public function register(Request $request)
    {
    $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'role' => 'required|in:etudiant,entreprise', 
            
             'filiere' => 'required_if:role,etudiant|string|nullable',
            'niveau_etude' => 'required_if:role,etudiant|string|nullable',
            
            'description' => 'required_if:role,entreprise|string|nullable',
            'site_web' => 'nullable|url',
        ]);

        $user = User::create([
            'nom' => $validatedData['nom'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),  
            'telephone' => $validatedData['telephone'] ?? null,
            'adresse' => $validatedData['adresse'] ?? null,
            'role' => $validatedData['role'],
            'filiere' => $validatedData['filiere'] ?? null,
            'niveau_etude' => $validatedData['niveau_etude'] ?? null,
            'description' => $validatedData['description'] ?? null,
            'site_web' => $validatedData['site_web'] ?? null, 
            'est_valide' => $validatedData['role'] === 'entreprise' ? false : true, 
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;
      return response()->json([
            'message' => 'Compte créé avec succès',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }



public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mot_de_passe' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

         if (!$user || !Hash::check($request->password, $user->pasword)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations de connexion sont incorrectes.'],
            ]);
        }

         $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }




    public function logout(Request $request)
    {
         $request->user()->currentAccessToken()->delete();
 
        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }
}
