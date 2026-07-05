<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nom' => 'Administrateur',
            'email' => 'admin@stageconnect.ma',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'est_valide' => true,
            'telephone' => '0600000000',
            'adresse' => 'Casablanca, Maroc',
        ]);
    }
}
