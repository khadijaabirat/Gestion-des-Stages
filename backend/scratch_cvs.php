<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('role','etudiant')->first();
$cvs = App\Models\Cv::where('user_id', $user->id)->orderBy('is_main', 'desc')->paginate(10);
echo json_encode(['data' => $cvs]);
