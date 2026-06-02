<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\Message;
class Conversation extends Model
{
    
 protected $fillable = ['Sujet', 'Statut'];
    public function users()
    {return $this->belongsToMany(User::class)
                    ->withPivot('role', 'last_read_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
