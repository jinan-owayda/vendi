<?php

namespace App\Http\Controllers\Vendor;

use Exception;
use App\Http\Controllers\Controller;
use App\Services\VendorDashboardService;

class DashboardController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $stats = VendorDashboardService::getDashboardStats(auth()->id());
            return $this->responseJSON($stats);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve dashboard stats.", 500);
        }
    }
}
