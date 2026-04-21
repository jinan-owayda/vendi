<?php

namespace App\Http\Controllers\Vendor;

use Exception;
use Illuminate\Http\Request;
use App\Services\OrderService;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    public function getAllOrders($id = null)
    {
        try {
            if ($id) {
                $order = OrderService::getVendorOrderById(auth()->id(), $id);

                if (!$order) {
                    return $this->responseJSON(null, "Order not found.", 404);
                }

                return $this->responseJSON($order);
            }

            $orders = OrderService::getVendorOrders(auth()->id());
            return $this->responseJSON($orders);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve orders.", 500);
        }
    }

    public function updateOrderStatus(Request $request, $id)
    {
        try {
            $order = OrderService::getVendorOrderById(auth()->id(), $id);

            if (!$order) {
                return $this->responseJSON(null, "Order not found.", 404);
            }

            $order = OrderService::updateOrderStatus($request->all(), $order);

            if ($order) {
                return $this->responseJSON($order);
            }

            return $this->responseJSON(null, "Failed to update order status.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while updating order status.", 500);
        }
    }
}