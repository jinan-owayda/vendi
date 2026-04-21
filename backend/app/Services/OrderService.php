<?php

namespace App\Services;

use App\Models\Order;

class OrderService
{
    static function getCustomerOrders($user_id, $id = null)
    {
        if (!$id) {
            return Order::with(['user', 'address', 'items'])
                ->where('user_id', $user_id)
                ->get();
        }

        return Order::with(['user', 'address', 'items'])
            ->where('user_id', $user_id)
            ->find($id);
    }

    static function getVendorOrders($vendor_id)
    {
        return Order::with(['user', 'address', 'items'])
            ->whereHas('items', function ($query) use ($vendor_id) {
                $query->where('vendor_id', $vendor_id);
            })
            ->get();
    }

    static function getVendorOrderById($vendor_id, $id)
    {
        return Order::with(['user', 'address', 'items'])
            ->whereHas('items', function ($query) use ($vendor_id) {
                $query->where('vendor_id', $vendor_id);
            })
            ->find($id);
    }

    static function createOrUpdateOrder($data, $order)
    {
        $order->user_id = $data['user_id'] ?? $order->user_id;
        $order->address_id = $data['address_id'] ?? $order->address_id;
        $order->order_number = $data['order_number'] ?? $order->order_number;
        $order->total_amount = $data['total_amount'] ?? $order->total_amount;
        $order->payment_method = $data['payment_method'] ?? $order->payment_method;
        $order->payment_status = $data['payment_status'] ?? $order->payment_status;
        $order->order_status = $data['order_status'] ?? $order->order_status;

        $order->save();

        return $order;
    }

    static function placeOrder($data)
    {
        $order = new Order;

        $order->user_id = $data['user_id'];
        $order->address_id = $data['address_id'];
        $order->order_number = 'ORD-' . time();
        $order->total_amount = $data['total_amount'];
        $order->payment_method = $data['payment_method'] ?? 'cash';
        $order->payment_status = $data['payment_status'] ?? 'pending';
        $order->order_status = $data['order_status'] ?? 'pending';

        $order->save();

        return $order;
    }

    static function updateOrderStatus($data, $order)
    {
        $order->order_status = $data['order_status'] ?? $order->order_status;
        $order->payment_status = $data['payment_status'] ?? $order->payment_status;

        $order->save();

        return $order;
    }

    static function deleteOrder($order)
    {
        return $order->delete();
    }
}