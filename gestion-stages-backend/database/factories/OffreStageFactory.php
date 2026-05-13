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
            'user_id' => User::factory()->entreprise(), 
            'titre' => 'Stage en ' . fake()->jobTitle(),
            'description' => fake()->realText(300),
            'date_debut' => fake()->dateTimeBetween('now', '+2 months')->format('Y-m-d'),
            'duree' => fake()->numberBetween(1, 6), 
            'statut' => fake()->randomElement(['ouverte', 'fermee']),
            'localisation' => fake()->city(),
        ];
    }
}
