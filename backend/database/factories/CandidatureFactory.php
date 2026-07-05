<?php

namespace Database\Factories;
use App\Models\User;
use App\Models\OffreStage;
use App\Models\Candidature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Candidature>
 */
class CandidatureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
       return [
            'user_id' => User::factory()->etudiant(),
            'offre_stage_id' => OffreStage::factory(),
            'cv_path' => 'cvs/' . fake()->uuid() . '.pdf', 
            'lettre_motivation' => fake()->realText(250),
            'statut' => fake()->randomElement(['en_attente', 'acceptee', 'refusee']),
        ];
    }
}
