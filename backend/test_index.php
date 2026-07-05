<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::find(2); // Etudiant

$conversations = $user->conversations()
    ->with(['users' => function($query) use ($user) {
        $query->where('users.id', '!=', $user->id)
              ->select('users.id', 'nom', 'role');
    }, 'messages' => function($query) {
        $query->latest()->take(1);  
    }])
    ->paginate(10);

echo json_encode($conversations->items());
