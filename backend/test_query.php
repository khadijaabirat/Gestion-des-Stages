<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Illuminate\Support\Facades\DB::enableQueryLog();

$start = microtime(true);
$user = App\Models\User::find(23);
$c = $user->conversations()->with(['users' => function($q) use ($user) {
    $q->where('users.id', '!=', $user->id);
}, 'messages' => function($q) {
    $q->latest()->take(1);
}])->paginate(10);
$end = microtime(true);

echo json_encode([
    'time' => $end - $start,
    'queries' => Illuminate\Support\Facades\DB::getQueryLog()
]);
