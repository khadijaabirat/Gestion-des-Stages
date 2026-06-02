<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cv extends Model
{
   protected $fillable = [
        'user_id', 'title', 'file_path', 'is_main'
    ];
    public function etudiant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function candidatures()
    {
        return $this->hasMany(Candidature::class);
    }
}
