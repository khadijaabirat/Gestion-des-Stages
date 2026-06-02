<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OffreStage;
use App\Models\Cv;
use App\Models\Experience;
use App\Models\Skill;
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
        $this->call([
            AdminSeeder::class,
            SkillsSeeder::class,
        ]);

        $entreprises = User::factory()->count(5)->entreprise()->create();

        $entreprises->each(function ($entreprise) {
            OffreStage::factory()->count(3)->create([
                'user_id' => $entreprise->id,
                'statut' => 'published',
            ]);
        });

        $skills = Skill::all();

        User::factory()->count(10)->etudiant()->create()->each(function ($etudiant) use ($skills) {
            $etudiant->skills()->attach(
                $skills->random(rand(3, 6))->pluck('id')->toArray()
            );

            Cv::create([
                'user_id' => $etudiant->id,
                'title' => 'CV_' . $etudiant->nom,
                'file_path' => 'cvs/dummy.pdf',
                'is_main' => true,
            ]);

            Experience::create([
                'user_id' => $etudiant->id,
                'titre' => 'Stage d\'observation',
                'entreprise' => 'Tech Company Maroc',
                'date_debut' => now()->subMonths(6),
                'date_fin' => now()->subMonths(4),
            ]);
        });
    }
}
