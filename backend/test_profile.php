<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::with(['skills', 'experiences', 'offresStages' => function ($q) {
    $q->where('statut', 'ouverte');
}])->find(3);

echo json_encode($user->toArray());
