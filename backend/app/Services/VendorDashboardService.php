<?php

namespace App\Services;

use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Store;

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

    $storeRating = Store::where('user_id', $vendor_id)->value('rating');

    return [
        'total_products' => $totalProducts,
        'total_orders' => $totalOrders,
        'total_revenue' => $revenue,
        'store_rating' => $storeRating ?? 0,
    ];
}
}