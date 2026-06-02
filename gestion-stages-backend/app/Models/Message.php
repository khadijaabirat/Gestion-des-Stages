<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Conversation;

class Message extends Model
{
    protected $fillable = ['content', 'user_id', 'conversation_id','is_read'];
    
    protected $casts = [
        'is_read' => 'boolean', 
    ];
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function expediteur()  
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
