<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Candidature;
use App\Models\User;
class OffreStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titre',
        'description',
        'date_debut',
        'date_expiration',
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
