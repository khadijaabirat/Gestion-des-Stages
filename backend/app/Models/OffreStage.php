<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Candidature;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class OffreStage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'titre',
        'description',
        'date_debut',
        'date_expiration',
        'duree',
        'statut',
        'localisation',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'statut' => \App\Enums\OffreStatus::class,
    ];

    public function entreprise()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function candidatures()
    {
        return $this->hasMany(Candidature::class);
    }

    public function scopePublished($query)
    {
        return $query->where('statut', 'published');
    }

    public function scopeActiveEntreprise($query)
    {
        return $query->whereHas('entreprise', function ($q) {
            $q->where('is_blocked', false)
              ->where('est_valide', true);
        });
    }
}
