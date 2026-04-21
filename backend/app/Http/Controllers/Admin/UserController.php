<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Services\AdminService;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function getAllUsers($id = null)
    {
        try {
            $users = AdminService::getAllUsers($id);
            return $this->responseJSON($users);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve users.", 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = AdminService::getAllUsers($id);

            if (!$user) {
                return $this->responseJSON(null, "User not found.", 404);
            }

            $deleted = AdminService::deleteUser($user);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete user.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting user.", 500);
        }
    }
}