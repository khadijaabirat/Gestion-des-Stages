<?php

namespace Database\Factories;

use App\Models\OffreStage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OffreStage>
 */
class OffreStageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), 
            'titre' => 'Stage en ' . fake()->jobTitle(),
            'description' => fake()->realText(300),   
            'date_debut' => fake()->dateTimeBetween('now', '+2 months')->format('Y-m-d'),
            'date_expiration' => fake()->dateTimeBetween('+2 months', '+3 months'),
            'duree' => fake()->numberBetween(1, 6), 
            'localisation' => fake()->city(),
'statut' => fake()->randomElement(['draft', 'published', 'published', 'closed']),           
        ];
    }
}
