<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;
class ConversationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {        /** @var User $user */

        $user = Auth::user();
       $conversations = $user->conversations()
            ->with(['users' => function($query) use ($user) {
                $query->where('users.id', '!=', $user->id)
                      ->select('users.id', 'nom', 'role');
            }, 'messages' => function($query) {
                $query->latest()->take(1);  
            }])
            ->paginate(10);

        return response()->json([
            'message' => 'Vos conversations',
            'data' => $conversations
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $authId = Auth::id();
        $targetId = $request->user_id;

         if ($authId == $targetId) {
            return response()->json(['message' => 'Vous ne pouvez pas créer une conversation avec vous-même.'], 400);
        }

         $conversation = Conversation::whereHas('users', function ($query) use ($authId) {
            $query->where('users.id', $authId);
        })->whereHas('users', function ($query) use ($targetId) {
            $query->where('users.id', $targetId);
        })->first();

         if ($conversation) {
            return response()->json([
                'message' => 'Conversation existante récupérée',
                'data' => $conversation->load('users:id,nom,role')
            ], 200);
        }

        $newConversation = DB::transaction(function () use ($authId, $targetId) {
            $conversation = Conversation::create();
            $conversation->users()->attach([$authId, $targetId]);
            return $conversation;
        });
        return response()->json([
            'message' => 'Nouvelle conversation créée avec succès',
            'data' => $newConversation->load('users:id,nom,role')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
  public function show($id)
    {
          /** @var User $user */
        $user = Auth::user();
        
        $conversation = $user->conversations()->where('conversations.id', $id)->first();

        if (!$conversation) {
            return response()->json(['message' => 'Conversation introuvable ou accès refusé.'], 403);
        }

$messages = $conversation->messages()
            ->with('expediteur:id,nom,role')
            ->latest() 
            ->paginate(10);

        return response()->json([
            'data' => $messages
        ], 200);
    }



      public function sendMessage(Request $request, $id)
    {   
       
        $request->validate([
            'content' =>'required|string|max:1000'
        ]);
     /** @var User $user */
        $user = Auth::user();
        
         $conversation = $user->conversations()->where('conversations.id', $id)->first();

        if (!$conversation) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

         $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'content' => $request->content,
            'is_read' => false
        ]);

         broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => 'Message envoyé',
            'data' => $message->load('expediteur:id,nom,role')
        ], 201);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
