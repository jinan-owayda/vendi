<?php

namespace App\Http\Controllers\Customer;

use Exception;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Services\OrderService;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    public function getAllOrders($id = null)
    {
        try {
            $orders = OrderService::getCustomerOrders(auth()->id(), $id);
            return $this->responseJSON($orders);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve orders.", 500);
        }
    }

    public function addOrUpdateOrder(Request $request, $id = null)
    {
        try {
            $order = new Order;

            if ($id) {
                $order = OrderService::getCustomerOrders(auth()->id(), $id);

                if (!$order) {
                    return $this->responseJSON(null, "Order not found.", 404);
                }
            }

            $data = $request->all();

            if (!$id) {
                $data['user_id'] = auth()->id();
            }

            $order = OrderService::createOrUpdateOrder($data, $order);

            if ($order) {
                return $this->responseJSON($order);
            }

            return $this->responseJSON(null, "Failed to save order.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving order.", 500);
        }
    }

    public function placeOrder(Request $request)
    {
        try {
            $data = $request->all();
            $data['user_id'] = auth()->id();

            $order = OrderService::placeOrder($data);

            if ($order) {
                return $this->responseJSON($order);
            }

            return $this->responseJSON(null, "Failed to place order.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while placing order.", 500);
        }
    }

    public function deleteOrder($id)
    {
        try {
            $order = OrderService::getCustomerOrders(auth()->id(), $id);

            if (!$order) {
                return $this->responseJSON(null, "Order not found.", 404);
            }

            $deleted = OrderService::deleteOrder($order);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete order.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting order.", 500);
        }
    }
}