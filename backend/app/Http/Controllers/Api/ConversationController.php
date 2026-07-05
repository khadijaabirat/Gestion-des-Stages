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
                      ->select('users.id', 'users.nom', 'users.role', 'users.photo');
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
                'data' => $conversation->load('users:users.id,users.nom,users.role')
            ], 200);
        }

        $newConversation = DB::transaction(function () use ($authId, $targetId) {
            $conversation = Conversation::create();
            $conversation->users()->attach([$authId, $targetId]);
            return $conversation;
        });
        return response()->json([
            'message' => 'Nouvelle conversation créée avec succès',
            'data' => $newConversation->load('users:users.id,users.nom,users.role')
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

        // Marquer les messages non lus comme lus
        $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $conversation->messages()
            ->with('expediteur:users.id,users.nom,users.role')
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

         try {
             broadcast(new MessageSent($message))->toOthers();
         } catch (\Exception $e) {
             // Ignorer l'erreur si le serveur websocket n'est pas lancé
             \Illuminate\Support\Facades\Log::error("Broadcast failed: " . $e->getMessage());
         }

        return response()->json([
            'message' => 'Message envoyé',
            'data' => $message->load('expediteur:users.id,users.nom,users.role')
        ], 201);
    }
    /**
     * Get the total unread messages count for the authenticated user.
     */
    public function unreadCount()
    {
        $user = Auth::user();
        $count = Message::whereHas('conversation.users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
        ->where('user_id', '!=', $user->id)
        ->where('is_read', false)
        ->count();

        return response()->json([
            'unread_count' => $count
        ], 200);
    }

    /**
     * Get the unread messages list for the authenticated user.
     */
    public function unreadMessages()
    {
        $user = Auth::user();
        
        $messages = Message::whereHas('conversation.users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
        ->where('user_id', '!=', $user->id)
        ->where('is_read', false)
        ->with('expediteur:users.id,users.nom,users.role')
        ->latest()
        ->take(5) // Get latest 5 unread messages
        ->get();

        return response()->json([
            'data' => $messages
        ], 200);
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
