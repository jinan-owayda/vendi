<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    static function getAllNotifications($user_id, $id = null)
    {
        if (!$id) {
            return Notification::where('user_id', $user_id)->get();
        }

        return Notification::where('user_id', $user_id)->find($id);
    }

    static function createOrUpdateNotification($data, $notification)
    {
        $notification->user_id = $data['user_id'] ?? $notification->user_id;
        $notification->title = $data['title'] ?? $notification->title;
        $notification->message = $data['message'] ?? $notification->message;
        $notification->type = $data['type'] ?? $notification->type;
        $notification->is_read = $data['is_read'] ?? $notification->is_read;

        $notification->save();

        return $notification;
    }

    static function markAsRead($notification)
    {
        $notification->is_read = true;
        $notification->save();

        return $notification;
    }

    static function deleteNotification($notification)
    {
        return $notification->delete();
    }
}