<?php

namespace App\Http\Controllers\Vendor;

use Exception;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    public function getAllNotifications($id = null)
    {
        try {
            $notifications = NotificationService::getAllNotifications(auth()->id(), $id);
            return $this->responseJSON($notifications);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve notifications.", 500);
        }
    }

    public function addOrUpdateNotification(Request $request, $id = null)
    {
        try {
            $notification = new Notification;

            if ($id) {
                $notification = NotificationService::getAllNotifications(auth()->id(), $id);

                if (!$notification) {
                    return $this->responseJSON(null, "Notification not found.", 404);
                }
            }

            $data = $request->all();

            if (!$id) {
                $data['user_id'] = auth()->id();
            }

            $notification = NotificationService::createOrUpdateNotification($data, $notification);

            if ($notification) {
                return $this->responseJSON($notification);
            }

            return $this->responseJSON(null, "Failed to save notification.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving notification.", 500);
        }
    }

    public function markAsRead($id)
    {
        try {
            $notification = NotificationService::getAllNotifications(auth()->id(), $id);

            if (!$notification) {
                return $this->responseJSON(null, "Notification not found.", 404);
            }

            $notification = NotificationService::markAsRead($notification);

            if ($notification) {
                return $this->responseJSON($notification);
            }

            return $this->responseJSON(null, "Failed to update notification.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while updating notification.", 500);
        }
    }

    public function deleteNotification($id)
    {
        try {
            $notification = NotificationService::getAllNotifications(auth()->id(), $id);

            if (!$notification) {
                return $this->responseJSON(null, "Notification not found.", 404);
            }

            $deleted = NotificationService::deleteNotification($notification);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete notification.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting notification.", 500);
        }
    }
}