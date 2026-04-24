<?php

namespace App\Http\Controllers\Customer;

use Exception;
use Illuminate\Http\Request;
use App\Models\OrderItem;
use App\Services\OrderItemService;
use App\Http\Controllers\Controller;

class OrderItemController extends Controller
{
    public function getAllOrderItems($id = null)
    {
        try {
            $items = OrderItemService::getAllOrderItems($id);
            return $this->responseJSON($items);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve order items.", 500);
        }
    }

    public function addOrUpdateOrderItem(Request $request, $id = null)
    {
        try {
            $orderItem = new OrderItem;

            if ($id) {
                $orderItem = OrderItemService::getAllOrderItems($id);

                if (!$orderItem) {
                    return $this->responseJSON(null, "Order item not found.", 404);
                }
            }

            $data = $request->all();
            $orderItem = OrderItemService::createOrUpdateOrderItem($data, $orderItem);

            if ($orderItem) {
                return $this->responseJSON($orderItem);
            }

            return $this->responseJSON(null, "Failed to save order item.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving order item.", 500);
        }
    }

    public function deleteOrderItem($id)
    {
        try {
            $orderItem = OrderItemService::getAllOrderItems($id);

            if (!$orderItem) {
                return $this->responseJSON(null, "Order item not found.", 404);
            }

            $deleted = OrderItemService::deleteOrderItem($orderItem);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete order item.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting order item.", 500);
        }
    }

    public function getBestSellerProducts()
{
    try {
        $products = OrderItemService::getBestSellerProductsLastWeek();

        return $this->responseJSON($products, "Best seller products retrieved successfully.");
    } catch (Exception $e) {
        return $this->responseJSON(null, "Failed to retrieve best seller products.", 500);
    }
}
}