<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use App\Models\OffreStage;
use App\Models\Cv;
class Candidature extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'offre_stage_id',
        'cv_id',                
        'cv_file_snapshot',    
        'lettre_motivation',
        'statut',
    ];

    protected $casts = [
        'statut' => \App\Enums\CandidatureStatus::class,
    ];

     public function etudiant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

     public function offreStage()
    {
        return $this->belongsTo(OffreStage::class);
    }
    public function cv()
    {
        return $this->belongsTo(Cv::class);
    }

    /**
     * Automatisation : Déclenche l'envoi de notification lorsque le statut est modifié.
     */
    protected static function booted()
    {
        static::updated(function ($candidature) {
            if ($candidature->isDirty('statut')) {
                $candidature->envoyerNotification();
            }
        });
    }

    /**
     * Méthode pour envoyer une notification à l'étudiant concernant l'état de sa candidature.
     */
    public function envoyerNotification()
    {
        try {
            $etudiant = $this->etudiant;
            if ($etudiant) {
                $this->loadMissing(['offreStage.entreprise']);
                $etudiant->notify(new \App\Notifications\CandidatureNotification($this, $this->statut));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Erreur lors de l'envoi de la notification de candidature : " . $e->getMessage());
        }
    }
}
