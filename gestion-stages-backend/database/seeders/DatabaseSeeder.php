<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OffreStage;
use App\Models\Candidature;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

       User::factory()->admin()->create([
            'nom' => 'Admin Principal',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'), 
        ]);
        User::factory(5)->entreprise()->hasOffresStages(3)->create();
        $etudiants = User::factory(10)->etudiant()->create();
        $offres = OffreStage::all();
        foreach ($etudiants as $etudiant) {
            Candidature::factory(2)->create([
                'user_id' => $etudiant->id,
                'offre_stage_id' => $offres->random()->id,
            ]);
        }
    }
}
