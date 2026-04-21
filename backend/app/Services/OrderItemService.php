<?php

namespace App\Services;

use App\Models\OrderItem;

class OrderItemService
{
    static function getAllOrderItems($id = null)
    {
        if (!$id) {
            return OrderItem::with(['order', 'product', 'vendor'])->get();
        }

        return OrderItem::with(['order', 'product', 'vendor'])->find($id);
    }

    static function createOrUpdateOrderItem($data, $orderItem)
    {
        $orderItem->order_id = $data['order_id'] ?? $orderItem->order_id;
        $orderItem->product_id = $data['product_id'] ?? $orderItem->product_id;
        $orderItem->vendor_id = $data['vendor_id'] ?? $orderItem->vendor_id;
        $orderItem->product_name = $data['product_name'] ?? $orderItem->product_name;
        $orderItem->quantity = $data['quantity'] ?? $orderItem->quantity;
        $orderItem->unit_price = $data['unit_price'] ?? $orderItem->unit_price;
        $orderItem->total_price = $data['total_price'] ?? $orderItem->total_price;

        $orderItem->save();

        return $orderItem;
    }

    static function deleteOrderItem($orderItem)
    {
        return $orderItem->delete();
    }
}