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
}
