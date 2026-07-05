<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Obtenir toutes les notifications de l'utilisateur connecté
     */
    public function index()
    {
        $user = Auth::user();
        
        $notifications = $user->notifications()->paginate(15);
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'message' => 'Liste des notifications',
            'unread_count' => $unreadCount,
            'data' => $notifications
        ], 200);
    }

    /**
     * Marquer une notification spécifique comme lue
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marquée comme lue'], 200);
        }

        return response()->json(['message' => 'Notification introuvable'], 404);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications sont marquées comme lues'], 200);
    }

    /**
     * Supprimer une notification
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->delete();
            return response()->json(['message' => 'Notification supprimée'], 200);
        }

        return response()->json(['message' => 'Notification introuvable'], 404);
    }
}
