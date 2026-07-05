<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Skill extends Model
{
    protected $fillable = ['nom', 'category', 'level', 'tags'];

    protected $casts = [
        'tags' => 'array'
    ];
    public function etudiants()
    {
        return $this->belongsToMany(User::class);
    }
}
