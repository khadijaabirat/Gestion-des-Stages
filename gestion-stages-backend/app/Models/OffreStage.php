<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class OffreStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titre',
        'description',
        'date_debut',
        'duree',
        'statut',
        'localisation',
    ];
    public function entreprise()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

     public function candidatures()
    {
        return $this->hasMany(Candidature::class);
    }
}
