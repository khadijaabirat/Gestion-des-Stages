<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Api\AuthController; 
use App\Http\Controllers\Api\OffreStageController;
use App\Http\Controllers\Api\CvController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\CandidatureController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
// Public routes for offers (both paths for compatibility)
Route::get('/offres', [OffreStageController::class, 'index']);
Route::get('/offres/{id}', [OffreStageController::class, 'show']);
Route::get('/offres-stage', [OffreStageController::class, 'index']);
Route::get('/offres-stage/{id}', [OffreStageController::class, 'show']);
Route::get('/skills', [AdminController::class, 'listSkills']);
Route::get('/home/data', [\App\Http\Controllers\Api\PublicController::class, 'homeData']);
    Broadcast::routes(['middleware' => ['auth:sanctum', 'banned']]);

    Route::middleware(['auth:sanctum','banned'])->group(function () {
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profil', [ProfilController::class, 'show']);
    Route::put('/profil', [ProfilController::class, 'update']);
 
    Route::get('/conversations/unread-count', [ConversationController::class, 'unreadCount']);
    Route::get('/messages/unread', [ConversationController::class, 'unreadMessages']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);  
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage'])->middleware('throttle:30,1');;
    Route::put('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::patch('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::get('/candidatures', [CandidatureController::class, 'index']);
    Route::post('/candidatures', [CandidatureController::class, 'store']);
    Route::get('/candidatures/{id}', [CandidatureController::class, 'show']);
    Route::put('/candidatures/{id}', [CandidatureController::class, 'update']);
    Route::delete('/candidatures/{id}', [CandidatureController::class, 'destroy']);
    Route::get('/candidatures/{id}/download-cv', [CandidatureController::class, 'downloadCvSnapshot']); 
    Route::put('/profil/password', [ProfilController::class, 'updatePassword']);
   
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
   
    // Users Search and Public Profiles
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'showPublicProfile']);
   
    Route::middleware('role:entreprise')->group(function () {
        Route::post('/entreprise/offres', [OffreStageController::class, 'store']);
        Route::put('/entreprise/offres/{id}', [OffreStageController::class, 'update']);
        Route::delete('/entreprise/offres/{id}', [OffreStageController::class, 'destroy']);
        Route::get('/entreprise/mes-offres', [OffreStageController::class, 'mesOffres']);
        Route::get('/entreprise/offres/{offreId}/candidatures', [CandidatureController::class, 'getByOffre']);
        Route::get('/entreprise/stats', [OffreStageController::class, 'entrepriseStats']);
     });


     Route::middleware('role:etudiant')->group(function () {
    Route::get('/cvs', [CvController::class, 'index']);
    Route::post('/cvs', [CvController::class, 'store']);
    Route::get('/cvs/{id}', [CvController::class, 'show']);
    Route::put('/cvs/{id}', [CvController::class, 'update']); 
    Route::patch('/cvs/{id}/set-main', [CvController::class, 'setAsMain']);
    Route::post('/cvs/{id}/set-main', [CvController::class, 'setAsMain']);
    Route::delete('/cvs/{id}', [CvController::class, 'destroy']);

    Route::post('/profil/skills', [ProfilController::class, 'syncSkills']);
    Route::post('/profil/experiences', [ProfilController::class, 'addExperience']);
    Route::put('/profil/experiences/{id}', [ProfilController::class, 'updateExperience']);
    Route::delete('/profil/experiences/{id}', [ProfilController::class, 'deleteExperience']);
     });


     Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'listUsers']);
        Route::get('/admin/users/trashed', [AdminController::class, 'listTrashedUsers']);
        Route::get('/admin/users/{id}/details', [AdminController::class, 'showUserDetails']);
        Route::patch('/admin/users/{id}/toggle-block', [AdminController::class, 'toggleBlockUser']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'softDeleteUser']);
        Route::patch('/admin/users/{id}/restore', [AdminController::class, 'restoreUser']);
        Route::patch('/admin/entreprises/{id}/validate', [AdminController::class, 'validateEntreprise']);

         Route::get('/admin/offres', [AdminController::class, 'listAllOffres']);
         Route::patch('/admin/offres/{id}/status', [AdminController::class, 'updateOfferStatus']);
         Route::delete('/admin/offres/{id}', [AdminController::class, 'deleteOffre']);

         Route::post('/admin/skills/merge', [AdminController::class, 'mergeSkills']);
         Route::post('/admin/skills', [AdminController::class, 'storeSkill']);
         Route::patch('/admin/skills/{id}', [AdminController::class, 'updateSkill']);
        Route::delete('/admin/skills/{id}', [AdminController::class, 'destroySkill']);

         Route::get('/admin/stats', [AdminController::class, 'getStats']);
     });
});