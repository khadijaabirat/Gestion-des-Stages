<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
   use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'email',
        'password',
        'telephone',
        'adresse',
        'role',
         'bio',
        'filiere',
        'niveau_etude',
         'description',
        'est_valide',
        'site_web',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'est_valide' => 'boolean',
        ];
    }
    public function offresStages()
    {
        return $this->hasMany(OffreStage::class, 'user_id');
    }

     public function candidatures()
    {
        return $this->hasMany(Candidature::class, 'user_id');
    }

     public function isEtudiant() { 
        return $this->role === 'etudiant'; 
        }
    public function isEntreprise() { 
        return $this->role === 'entreprise'; 
        }
    public function isAdmin() { 
        return $this->role === 'admin';
         }
}
