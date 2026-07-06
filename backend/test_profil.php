<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::where('role', 'etudiant')->first();
Illuminate\Support\Facades\Auth::login($user);

$request = Illuminate\Http\Request::create('/api/profil', 'PUT', [
    'nom' => 'Test',
    'email' => $user->email,
    'filiere' => 'GI'
]);

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
