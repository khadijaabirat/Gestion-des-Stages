<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$authId = 2; // Etudiant
$targetId = 3; // Entreprise

$conversation = \App\Models\Conversation::whereHas('users', function ($query) use ($authId) {
    $query->where('users.id', $authId);
})->whereHas('users', function ($query) use ($targetId) {
    $query->where('users.id', $targetId);
})->first();

if ($conversation) {
    echo "Exists: " . $conversation->id . "\n";
} else {
    $newConversation = \Illuminate\Support\Facades\DB::transaction(function () use ($authId, $targetId) {
        $conversation = \App\Models\Conversation::create();
        $conversation->users()->attach([$authId, $targetId]);
        return $conversation;
    });
    echo "Created: " . $newConversation->id . "\n";
}
