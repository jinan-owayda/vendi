<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Services\AdminService;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $stats = AdminService::getDashboardStats();
            return $this->responseJSON($stats);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve dashboard stats.", 500);
        }
    }
}