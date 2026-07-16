<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    private $supportedProviders = ['google'];

    /**
     * Redirect the user to the Social authentication page.
     */
    public function redirectToProvider($provider)
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=' . urlencode("Le fournisseur {$provider} n'est pas supporté."));
        }

        $driver = $provider === 'linkedin' ? 'linkedin-openid' : $provider;

        $socialite = Socialite::driver($driver)->stateless();
        
        if ($provider === 'linkedin') {
            $socialite->scopes(['openid', 'profile', 'email']);
        }

        return $socialite->redirect();
    }

    /**
     * Obtain the user information from the Provider.
     */
    public function handleProviderCallback(Request $request, $provider)
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=' . urlencode("Le fournisseur {$provider} n'est pas supporté."));
        }

        $driver = $provider === 'linkedin' ? 'linkedin-openid' : $provider;

        try {
            $socialUser = Socialite::driver($driver)->stateless()->user();
            
            // Check if a user with this email already exists
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // If user exists, update their auth_provider and provider_id
                $user->update([
                    'auth_provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                ]);
                if (!$user->photo && $socialUser->getAvatar()) {
                    $user->update(['photo' => $socialUser->getAvatar()]);
                }
            } else {
                // If user doesn't exist, create a new one (as 'etudiant' by default)
                $user = User::create([
                    'nom' => $socialUser->getName() ?? 'Utilisateur',
                    'email' => $socialUser->getEmail(),
                    'password' => bcrypt(Str::random(24)), // Random password for SSO users
                    'role' => 'etudiant',
                    'photo' => $socialUser->getAvatar(),
                    'est_valide' => true,
                    'auth_provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                ]);
            }

            // Log the user in (Sanctum SPA authentication)
            Auth::login($user);
            $request->session()->regenerate();
            
            // Generate a token just in case
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend dashboard with cookies
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/etudiant/dashboard')
                ->cookie('userRole', 'etudiant', 60 * 24 * 30, '/', null, false, false)
                ->cookie('userName', $user->nom ?? 'Étudiant', 60 * 24 * 30, '/', null, false, false)
                ->cookie('token', $token, 60 * 24 * 30, '/', null, false, false);

        } catch (\Exception $e) {
            $providerName = ucfirst($provider);
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=' . urlencode("Erreur de connexion {$providerName}: " . $e->getMessage()));
        }
    }
}
