<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\RegisterRequest;  
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\RateLimiter; 
use Illuminate\Support\Str;
 

class AuthController extends Controller
{ 
    public function register(RegisterRequest $request)
    {
    $validatedData = $request->validated();

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

        if ($user->role === 'entreprise') {
            return response()->json([
                'message' => 'Compte créé avec succès. Votre compte est en attente de validation par l\'administration.',
                'user' => $user,
            ], 201);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
      return response()->json([
            'message' => 'Compte créé avec succès',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }
 
    public function login(LoginRequest $request)
    {
        $validatedData = $request->validated();
$throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

         if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Trop de tentatives de connexion. Veuillez réessayer dans $seconds secondes."
            ], 429);  
        }
        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
        RateLimiter::hit($throttleKey);        
        throw ValidationException::withMessages([
                'email' => ['Les informations de connexion sont incorrectes.'],
            ]);
        }

        if($user->is_blocked){
           RateLimiter::hit($throttleKey);
            return response()->json([
                'message' => 'Votre compte est bloqué par l\'administration.'
            ], 403);
        }
        if($user->role=='entreprise'&& !$user->est_valide){
          RateLimiter::hit($throttleKey);
            return response()->json([
                'message' => 'Votre compte entreprise est en cours de validation par l\'administration.'
            ], 403);
        }
        RateLimiter::clear($throttleKey);
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
