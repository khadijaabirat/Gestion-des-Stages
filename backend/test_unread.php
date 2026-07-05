<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Message;
use Illuminate\Support\Facades\Auth;

$user = \App\Models\User::find(2); // Etudiant
Auth::login($user);

$count = Message::whereHas('conversation.users', function ($query) use ($user) {
    $query->where('users.id', $user->id);
})
->where('user_id', '!=', $user->id)
->where('is_read', false)
->count();

echo json_encode(['unread_count' => $count]) . "\n";
