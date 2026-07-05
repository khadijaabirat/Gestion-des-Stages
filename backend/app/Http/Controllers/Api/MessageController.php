<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageUpdated;  
use App\Events\MessageDeleted; 
use App\Events\MessageRead;
class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
       $request->validate([
            'content' => 'required|string'
        ]);

        $message = Message::find($id);

        if (!$message) {
            return response()->json(['message' => 'Message introuvable.'], 404);
        }

         if ($message->user_id !== Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez modifier que vos propres messages.'], 403);
        }

         if ($message->is_read) {
            return response()->json(['message' => 'Impossible de modifier le message car il a déjà été lu.'], 400);
        }

         $message->update([
            'content' => $request->content
        ]);

            broadcast(new MessageUpdated($message))->toOthers();

        return response()->json([
            'message' => 'Message modifié avec succès',
            'data' => $message
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
       $message = Message::find($id);

        if (!$message) {
            return response()->json(['message' => 'Message introuvable.'], 404);
        }

         if ($message->user_id !== Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez supprimer que vos propres messages.'], 403);
        }

         if ($message->is_read) {
            return response()->json(['message' => 'Impossible de supprimer le message car il a déjà été lu.'], 400);
        }

         $conversationId = $message->conversation_id;
        $message->delete();

        broadcast(new MessageDeleted($id, $conversationId))->toOthers();
        return response()->json([
            'message' => 'Message supprimé avec succès'
        ], 200);
    }


public function markAsRead($id)
    {
        $message = Message::find($id);

        if (!$message) {
            return response()->json(['message' => 'Message introuvable.'], 404);
        }

         if ($message->user_id === Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas marquer vos propres messages comme lus.'], 400);
        }

         $isParticipant = $message->conversation->users()->where('users.id', Auth::id())->exists();
        
        if (!$isParticipant) {
            return response()->json(['message' => 'Accès refusé. Vous ne faites pas partie de cette conversation.'], 403);
        }

         $message->update(['is_read' => true]);
        
        broadcast(new MessageRead($message))->toOthers();
        
        return response()->json([
            'message' => 'Message marqué comme lu'
        ], 200);
    }
}
