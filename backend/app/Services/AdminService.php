<?php

namespace App\Services;

use App\Models\User;
use App\Models\Store;
use App\Models\Order;
use App\Models\Product;

class AdminService
{
    static function getAllUsers($id = null)
    {
        if (!$id) {
            return User::get();
        }

        return User::find($id);
    }

    static function getAllStores($id = null)
    {
        if (!$id) {
            return Store::with('user')->get();
        }

        return Store::with('user')->find($id);
    }

    static function getAllProducts($id = null)
    {
        if (!$id) {
            return Product::with(['vendor', 'store'])->get();
        }

        return Product::with(['vendor', 'store'])->find($id);
    }

    static function getAllOrders($id = null)
    {
        if (!$id) {
            return Order::with(['user', 'address', 'items'])->get();
        }

        return Order::with(['user', 'address', 'items'])->find($id);
    }

    static function deleteUser($user)
    {
        return $user->delete();
    }

    static function deleteStore($store)
    {
        return $store->delete();
    }

    static function deleteProduct($product)
    {
        return $product->delete();
    }

    static function getDashboardStats()
    {
        return [
            'total_users' => User::count(),
            'total_stores' => Store::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            
        ];
    }
}