<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    { 
        if ($request->user() && $request->user()->is_blocked) {
            
            // Zidna ghir ? bach n-tfadaw ay erreur null
            $request->user()->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Votre compte a été suspendu par l\'administration. Veuillez nous contacter pour plus d\'informations.'
            ], 403);
        }
        
        return $next($request);
    }
}