<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
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
            'document_juridique' => $request->hasFile('document_juridique') 
                ? ((env('CLOUDINARY_URL') && env('CLOUDINARY_URL') !== 'cloudinary://API_KEY:API_SECRET@CLOUD_NAME') 
                    ? cloudinary()->uploadApi()->upload($request->file('document_juridique')->getRealPath(), ['folder' => 'documents', 'resource_type' => 'auto'])['secure_url'] 
                    : $request->file('document_juridique')->store('documents', 'public')) 
                : null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
      return response()->json([
            'message' => 'Compte créé avec succès. '. ($user->role === 'entreprise' ? 'Votre compte est en attente de validation.' : ''),
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
        RateLimiter::clear($throttleKey);
        
        // --- NOUVEAU : Création de la session Stateful (Cookie HttpOnly) ---
        Auth::login($user);
        $request->session()->regenerate();

        // Optionnel : On garde le token pour une éventuelle App Mobile, 
        // mais le Front Next.js va utiliser le cookie de session généré juste au-dessus.
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
         // Supprimer les tokens API
         $request->user()->currentAccessToken()?->delete();
         
         // --- NOUVEAU : Détruire la session Stateful ---
         Auth::guard('web')->logout();
         $request->session()->invalidate();
         $request->session()->regenerateToken();
 
        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }
}
