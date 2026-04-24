<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Exception;

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
        return DB::transaction(function () use ($data, $orderItem) {

            $isNew = !$orderItem->exists;

            $oldQuantity = $orderItem->quantity ?? 0;

            $orderItem->order_id = $data['order_id'] ?? $orderItem->order_id;
            $orderItem->product_id = $data['product_id'] ?? $orderItem->product_id;
            $orderItem->vendor_id = $data['vendor_id'] ?? $orderItem->vendor_id;
            $orderItem->product_name = $data['product_name'] ?? $orderItem->product_name;
            $orderItem->quantity = $data['quantity'] ?? $orderItem->quantity;
            $orderItem->unit_price = $data['unit_price'] ?? $orderItem->unit_price;
            $orderItem->total_price = $data['total_price'] ?? $orderItem->total_price;

            $product = Product::find($orderItem->product_id);

            if (!$product) {
                throw new Exception("Product not found");
            }

            if ($isNew) {
                if ($product->stock_quantity < $orderItem->quantity) {
                    throw new Exception("Not enough stock available");
                }

                $product->stock_quantity -= $orderItem->quantity;
                $product->save();
            } else {
                $difference = $orderItem->quantity - $oldQuantity;

                if ($difference > 0) {
                    if ($product->stock_quantity < $difference) {
                        throw new Exception("Not enough stock available");
                    }

                    $product->stock_quantity -= $difference;
                    $product->save();
                } elseif ($difference < 0) {
                    $product->stock_quantity += abs($difference);
                    $product->save();
                }
            }

            $orderItem->save();

            return $orderItem;
        });
    }

    static function deleteOrderItem($orderItem)
    {
        return DB::transaction(function () use ($orderItem) {
            $product = Product::find($orderItem->product_id);

            if ($product) {
                $product->stock_quantity += $orderItem->quantity;
                $product->save();
            }

            return $orderItem->delete();
        });
    }

    static function getBestSellerProductsLastWeek($limit = 10)
{
    return OrderItem::select(
            'product_id',
            DB::raw('SUM(quantity) as total_purchased')
        )
        ->with('product')
        ->where('created_at', '>=', now()->subWeek())
        ->groupBy('product_id')
        ->orderByDesc('total_purchased')
        ->limit($limit)
        ->get();
}
}