<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$query = 'Wat';
$role = 'entreprise';

$usersQuery = \App\Models\User::where('id', '!=', 1)
    ->where('is_blocked', false); // Ne pas afficher les bloqués

if ($query) {
    $usersQuery->where('nom', 'like', '%' . $query . '%');
}

if ($role) {
    $usersQuery->where('role', $role);
} else {
    // Par défaut, un étudiant cherche des entreprises et vice-versa, mais on peut tout retourner
    $usersQuery->whereIn('role', ['etudiant', 'entreprise']);
}

// On exclut les entreprises non validées
$usersQuery->where(function($q) {
    $q->where('role', '!=', 'entreprise')
      ->orWhere('est_valide', true);
});

$users = $usersQuery->select('id', 'nom', 'role', 'filiere', 'secteur_activite', 'ville')
    ->take(10)
    ->get();

echo "Count: " . count($users) . "\n";
print_r($users->toArray());
