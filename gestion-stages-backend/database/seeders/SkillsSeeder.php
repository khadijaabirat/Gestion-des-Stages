<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;

class SkillsSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            'PHP', 'Laravel', 'JavaScript', 'Vue.js', 'React', 'Angular',
            'Node.js', 'Python', 'Django', 'Java', 'Spring Boot',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
            'HTML/CSS', 'Bootstrap', 'Tailwind CSS',
            'Git', 'Docker', 'AWS', 'Azure',
            'REST API', 'GraphQL', 'Microservices',
            'Agile/Scrum', 'Testing', 'CI/CD',
            'Communication', 'Travail d\'équipe', 'Gestion de projet'
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate(['nom' => $skill]);
        }
    }
}
