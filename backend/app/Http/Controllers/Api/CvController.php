<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CvController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

        $cvs = Cv::where('user_id', $user->id)->orderBy('is_main', 'desc')->paginate(10);

        return response()->json([
            'message' => 'Vos CVs',
            'data' => $cvs
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

         $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf|max:2048',  
        ]);
         $cvCount = Cv::where('user_id', $user->id)->count();
        if ($cvCount >= 5) {
            return response()->json(['message' => 'Vous ne pouvez pas avoir plus de 5 CVs.'], 400);
        }

         if ($request->hasFile('file')) {
            $path = $request->file('file')->store('cvs', 'public');
            
             $isMain = $cvCount === 0 ? true : false;

            $cv = Cv::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'file_path' => $path,
                'is_main' => $isMain
            ]);

            return response()->json([
                'message' => 'CV uploadé avec succès',
                'data' => $cv
            ], 201);
        }

        return response()->json(['message' => 'Fichier introuvable'], 400);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cv = Cv::find($id);

        if (!$cv) {
            return response()->json(['message' => 'CV introuvable'], 404);
        }

      if ($cv->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé. Ce CV ne vous appartient pas.'], 403);
        }

        return response()->json([
            'data' => $cv,
            'file_url' => asset('storage/' . $cv->file_path) 
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        if ($user->role !== 'etudiant') {
            return response()->json(['message' => 'Action réservée aux étudiants.'], 403);
        }

         $request->validate([
            'title' => 'required|string|max:255',
        ]);

         $cv = Cv::where('id', $id)->where('user_id', $user->id)->first();

        if (!$cv) {
            return response()->json(['message' => 'CV introuvable ou ne vous appartient pas.'], 404);
        }

         $cv->update([
            'title' => $request->title
        ]);

        return response()->json([
            'message' => 'Titre du CV modifié avec succès',
            'data' => $cv
        ], 200);
    }
    
public function setAsMain($id)
    {
        $user = Auth::user();
        
        $cv = Cv::where('id', $id)->where('user_id', $user->id)->first();

        if (!$cv) {
            return response()->json(['message' => 'CV introuvable ou ne vous appartient pas.'], 404);
        }

         Cv::where('user_id', $user->id)->update(['is_main' => false]);

         $cv->update(['is_main' => true]);

        return response()->json([
            'message' => 'Ce CV est maintenant votre CV principal',
            'data' => $cv
        ], 200);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       $user = Auth::user();
$cv = Cv::withCount('candidatures')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();
        if (!$cv) {
            return response()->json(['message' => 'CV introuvable'], 404);
        }
       if ($cv->candidatures_count > 0) {
            return response()->json(['message' => 'Impossible de supprimer ce CV car il est lié à une candidature.'], 400);
        }

        $totalCvs = Cv::where('user_id', $user->id)->count();
        if ($cv->is_main && $totalCvs > 1) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre CV principal. Choisissez-en un autre d\'abord.'], 400);
        }
         if (Storage::disk('public')->exists($cv->file_path)) {
            Storage::disk('public')->delete($cv->file_path);
        }

         $cv->delete();

        return response()->json([
            'message' => 'CV supprimé avec succès'
        ], 200);
    }
}
