<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\OffreStage;
use App\Models\Candidature;
use App\Models\Skill;
use App\Models\Cv;
use App\Models\Experience;
 use App\Models\Conversation;
use App\Models\Message;


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
        'is_blocked',
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

        public function skills()
    {
        return $this->belongsToMany(Skill::class);
    }
    
    public function cvs()
    {
        return $this->hasMany(Cv::class);
    }
    
    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }
 

    public function conversations()
    {
         return $this->belongsToMany(Conversation::class)
                    ->withPivot('role', 'last_read_at'); 
    }
    
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
  

 
}
