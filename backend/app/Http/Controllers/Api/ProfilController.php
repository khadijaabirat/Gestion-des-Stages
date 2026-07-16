<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
    use Illuminate\Validation\ValidationException;
class ProfilController extends Controller
{
   public function show()
    {
        /** @var User $user */
        $user = Auth::user();

         if ($user->role === 'etudiant') {
            $user->load(['skills', 'experiences']);
        }

        return response()->json([
            'message' => 'Détails du profil',
            'data' => $user
        ], 200);
    }

    public function update(Request $request)
    { /** @var User $user */
        $user = Auth::user();

         $rules = [
            'nom' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ];

         if ($user->role === 'entreprise') {
            $rules['description'] = 'sometimes|string';
            $rules['site_web'] = 'nullable|url';
        } elseif ($user->role === 'etudiant') {
            $rules['bio'] = 'nullable|string';
            $rules['filiere'] = 'sometimes|string';
            $rules['niveau_etude'] = 'sometimes|string';
        }

        $validatedData = $request->validate($rules);

        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo si elle existe
            if ($user->photo) {
                if (str_starts_with($user->photo, 'http')) {
                    // Cloudinary handles overwrites if public_id is used, or we just leave it for now.
                } else {
                    $oldPath = str_replace('/storage/', '', $user->photo);
                    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                    }
                }
            }

            if (env('CLOUDINARY_URL') && env('CLOUDINARY_URL') !== 'cloudinary://API_KEY:API_SECRET@CLOUD_NAME') {
                try {
                    $result = cloudinary()->uploadApi()->upload($request->file('photo')->getRealPath(), ['folder' => 'photos', 'resource_type' => 'auto']);
                    $validatedData['photo'] = $result['secure_url'];
                } catch (\Exception $e) {
                    $path = $request->file('photo')->store('photos', 'public');
                    $validatedData['photo'] = '/storage/' . $path;
                }
            } else {
                $path = $request->file('photo')->store('photos', 'public');
                $validatedData['photo'] = '/storage/' . $path;
            }
        }

         $user->update($validatedData);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'data' => $user
        ], 200);
    }

    public function syncSkills(Request $request)
    { /** @var User $user */
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

        $request->validate([
            'skills' => 'required|array',
            'skills.*' => 'exists:skills,id',  
        ]);

         $user->skills()->sync($request->skills);

        return response()->json([
            'message' => 'Compétences mises à jour avec succès',
            'data' => $user->load('skills')
        ], 200);
    }

    public function addExperience(Request $request)
    {  /** @var User $user */
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

        $validatedData = $request->validate([
            'titre' => 'required|string|max:255',
            'entreprise' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
        ]);

        $experience = $user->experiences()->create($validatedData);

        return response()->json([
            'message' => 'Expérience ajoutée avec succès',
            'data' => $experience
        ], 201);
    }

    public function updateExperience(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

        $experience = Experience::where('id', $id)->where('user_id', $user->id)->first();

        if (!$experience) {
            return response()->json(['message' => 'Expérience introuvable ou ne vous appartient pas.'], 404);
        }

        $validatedData = $request->validate([
            'titre' => 'required|string|max:255',
            'entreprise' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
        ]);

        $experience->update($validatedData);

        return response()->json([
            'message' => 'Expérience mise à jour avec succès',
            'data' => $experience
        ], 200);
    }

    public function deleteExperience($id)
    {
        $user = Auth::user();

        $experience = Experience::where('id', $id)->where('user_id', $user->id)->first();

        if (!$experience) {
            return response()->json(['message' => 'Expérience introuvable ou ne vous appartient pas.'], 404);
        }

        $experience->delete();

        return response()->json(['message' => 'Expérience supprimée avec succès'], 200);
    }


    public function updatePassword(Request $request)
    {
        $validatedData = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',  
        ]);
/** @var User $user */
        $user = Auth::user();

         if (!Hash::check($validatedData['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

         $user->update([
            'password' => Hash::make($validatedData['new_password'])
        ]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.'], 200);
    }
}
