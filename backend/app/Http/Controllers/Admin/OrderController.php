<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Services\AdminService;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    public function getAllOrders($id = null)
    {
        try {
            $orders = AdminService::getAllOrders($id);
            return $this->responseJSON($orders);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve orders.", 500);
        }
    }
}