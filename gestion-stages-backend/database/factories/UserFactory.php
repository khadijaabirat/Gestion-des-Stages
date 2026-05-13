<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'remember_token' => Str::random(10),
        ];
    }
public function etudiant(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'etudiant',
            'bio' => fake()->realText(100),
            'filiere' => fake()->randomElement(['Développement Web', 'Mobile', 'Data Science', 'Design']),
            'niveau_etude' => fake()->randomElement(['Bac+2', 'Bac+3', 'Bac+5']),
        ]);
    }
    public function entreprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'entreprise',
            'nom' => fake()->company(),  
            'description' => fake()->realText(200),
            'est_valide' => fake()->boolean(80),  
            'site_web' => fake()->url(),
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }
    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
