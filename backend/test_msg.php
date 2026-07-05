<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;

$user = \App\Models\User::find(2); // Etudiant
Auth::login($user);

$id = 4; // L'ID de la conversation créée tout à l'heure
$conversation = $user->conversations()->where('conversations.id', $id)->first();

if (!$conversation) {
    echo "Conversation $id introuvable pour le user 2\n";
    exit;
}

try {
    $message = Message::create([
        'conversation_id' => $conversation->id,
        'user_id' => $user->id,
        'content' => 'Test message',
        'is_read' => false
    ]);

    echo "Message créé avec l'ID: " . $message->id . "\n";
    
    // Test broadcast
    echo "Testing broadcast...\n";
    broadcast(new MessageSent($message))->toOthers();
    echo "Broadcast réussi\n";

    $loadedMessage = $message->load('expediteur:users.id,users.nom,users.role');
    echo "Loaded Message: \n";
    print_r($loadedMessage->toArray());
} catch (\Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
