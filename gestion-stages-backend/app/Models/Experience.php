<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Experience extends Model
{
   protected $fillable = [
        'titre',          
        'entreprise',
        'date_debut',
        'date_fin',
        'user_id',
    ];
     public function etudiant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
}
