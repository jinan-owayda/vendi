<?php

namespace App\Http\Controllers\Customer;

use Exception;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Services\CartService;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    public function getCartItems($id = null)
    {
        try {
            $cartItems = CartService::getCartItems(auth()->id(), $id);
            return $this->responseJSON($cartItems);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve cart items.", 500);
        }
    }

    public function addOrUpdateCartItem(Request $request, $id = null)
    {
        try {
            $cartItem = null;

            if ($id) {
                $cartItem = CartService::getCartItems(auth()->id(), $id);

                if (!$cartItem) {
                    return $this->responseJSON(null, "Cart item not found.", 404);
                }
            }

            $cartItem = CartService::addOrUpdateCartItem($request->all(), auth()->id(), $cartItem);

            if ($cartItem) {
                return $this->responseJSON($cartItem);
            }

            return $this->responseJSON(null, "Failed to save cart item.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving cart item.", 500);
        }
    }

    public function deleteCartItem($id)
    {
        try {
            $cartItem = CartService::getCartItems(auth()->id(), $id);

            if (!$cartItem) {
                return $this->responseJSON(null, "Cart item not found.", 404);
            }

            $deleted = CartService::deleteCartItem($cartItem);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete cart item.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting cart item.", 500);
        }
    }

    public function clearCart()
    {
        try {
            CartService::clearCart(auth()->id());
            return $this->responseJSON(null);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to clear cart.", 500);
        }
    }

    public function getCartTotal()
    {
        try {
            $cart = CartService::getCartTotal(auth()->id());
            return $this->responseJSON($cart);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve cart total.", 500);
        }
    }
}