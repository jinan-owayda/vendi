<?php

namespace App\Services;

use App\Models\Product;
use App\Models\OrderItem;

class VendorDashboardService
{
    static function getDashboardStats($vendor_id)
    {
        $totalProducts = Product::where('vendor_id', $vendor_id)->count();

        $totalOrders = OrderItem::where('vendor_id', $vendor_id)
            ->distinct('order_id')
            ->count('order_id');

        $revenue = OrderItem::where('vendor_id', $vendor_id)
            ->sum('total_price');

        return [
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_revenue' => $revenue,
        ];
    }
}