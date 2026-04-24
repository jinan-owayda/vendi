<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;
use Exception;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $user = AuthService::login($request);

            if ($user) {
                return $this->responseJSON($user);
            }

            return $this->responseJSON(null, "Invalid credentials.", 401);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Login failed.", 500);
        }
    }

    public function register(Request $request)
    {
        try {
            $user = AuthService::register($request);

            if ($user) {
                return $this->responseJSON($user);
            }

            return $this->responseJSON(null, "Registration failed.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error during registration.", 500);
        }
    }


    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return $this->responseJSON(null, "Logged out successfully.");
        } catch (Exception $e) {
            return $this->responseJSON(null, "Logout failed.", 500);
        }
    }

    public function resetPassword(Request $request)
{
    try {
        $user = AuthService::resetPassword($request);

        if ($user) {
            return $this->responseJSON($user, "Password reset successfully.");
        }

        return $this->responseJSON(null, "User not found.", 404);
    } catch (Exception $e) {
        return $this->responseJSON(null, "Password reset failed.", 500);
    }
}
}
