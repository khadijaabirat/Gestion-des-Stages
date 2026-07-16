<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\SocialAuthController;

Route::get('/', function () {
    return view('welcome');
});

// Social SSO (web middleware is applied automatically)
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

// Fallback/Alias routes for users who still have /api/auth in their OAuth config
Route::get('/api/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/api/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
