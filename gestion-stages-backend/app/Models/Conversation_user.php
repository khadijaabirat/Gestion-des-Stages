<?php

namespace App\Models;

 use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Pivot;
class Conversation_user extends Pivot
{
    protected $table = 'conversation_user';
    protected $fillable = [
        'conversation_id', 'user_id'
    ];

    public function conversations()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function users()
    {
        return $this->belongsTo(User::class);
    }

}
