<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;

class CartService
{
    static function getCartItems($user_id, $id = null)
    {
        if (!$id) {
            return CartItem::with('product')
                ->where('user_id', $user_id)
                ->get();
        }

        return CartItem::with('product')
            ->where('user_id', $user_id)
            ->find($id);
    }

    static function addOrUpdateCartItem($data, $user_id, $cartItem = null)
    {
        if ($cartItem) {
            $cartItem->quantity = $data['quantity'] ?? $cartItem->quantity;
            $cartItem->save();
            return $cartItem;
        }

        $existingCartItem = CartItem::where('user_id', $user_id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($existingCartItem) {
            $existingCartItem->quantity += $data['quantity'] ?? 1;
            $existingCartItem->save();
            return $existingCartItem;
        }

        $cartItem = new CartItem;
        $cartItem->user_id = $user_id;
        $cartItem->product_id = $data['product_id'];
        $cartItem->quantity = $data['quantity'] ?? 1;
        $cartItem->save();

        return $cartItem;
    }

    static function deleteCartItem($cartItem)
    {
        return $cartItem->delete();
    }

    static function clearCart($user_id)
    {
        return CartItem::where('user_id', $user_id)->delete();
    }

    static function getCartTotal($user_id)
    {
        $cartItems = CartItem::with('product')
            ->where('user_id', $user_id)
            ->get();

        $total = 0;

        foreach ($cartItems as $item) {
            if ($item->product) {
                $total += $item->product->price * $item->quantity;
            }
        }

        return [
            'items' => $cartItems,
            'total' => $total
        ];
    }
}