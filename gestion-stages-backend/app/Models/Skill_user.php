<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Relations\Pivot;
use App\Models\User;
use App\Models\Skill;

class Skill_user extends Pivot
{
    protected $table = 'skill_user';
    protected $fillable = [
        'user_id', 'skill_id',
    ];

    public function users(){
        return $this->belongsTo(User::class);
    }

    public function skills(){
        return $this->belongsTo(Skill::class);
    }
    
}
