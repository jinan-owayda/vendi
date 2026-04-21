<?php

use Illuminate\Support\Facades\Route;

// Auth
use App\Http\Controllers\AuthController;

// Customer
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\OrderItemController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\NotificationController;

// Vendor
use App\Http\Controllers\Vendor\ProductController as VendorProductController;
use App\Http\Controllers\Vendor\OrderController as VendorOrderController;
use App\Http\Controllers\Vendor\StoreController;
use App\Http\Controllers\Vendor\NotificationController as VendorNotificationController;
use App\Http\Controllers\Vendor\DashboardController as VendorDashboardController;

// Admin
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\StoreController as AdminStoreController;
use App\Http\Controllers\Admin\DashboardController;

Route::group(["prefix" => "v0.1"], function () {

    // Guest
    Route::group(["prefix" => "guest"], function () {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/register", [AuthController::class, "register"]);
    });

    Route::group(["middleware" => "auth:sanctum"], function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        // Customer
        Route::group(["prefix" => "customer"], function () {

            // Products
            Route::get('/products/{id?}', [ProductController::class, "getAllProducts"]);

            // Cart
            Route::get('/cart/{id?}', [CartController::class, "getCartItems"]);
            Route::post('/add_update_cart/{id?}', [CartController::class, "addOrUpdateCartItem"]);
            Route::delete('/delete_cart_item/{id}', [CartController::class, "deleteCartItem"]);
            Route::delete('/clear_cart', [CartController::class, "clearCart"]);
            Route::get('/cart_total', [CartController::class, "getCartTotal"]);

            // Orders
            Route::get('/orders/{id?}', [OrderController::class, "getAllOrders"]);
            Route::post('/add_update_order/{id?}', [OrderController::class, "addOrUpdateOrder"]);
            Route::post('/place_order', [OrderController::class, "placeOrder"]);
            Route::delete('/delete_order/{id}', [OrderController::class, "deleteOrder"]);

            // Order Items
            Route::get('/order_items/{id?}', [OrderItemController::class, "getAllOrderItems"]);
            Route::post('/add_update_order_item/{id?}', [OrderItemController::class, "addOrUpdateOrderItem"]);
            Route::delete('/delete_order_item/{id}', [OrderItemController::class, "deleteOrderItem"]);

            // Addresses
            Route::get('/addresses/{id?}', [AddressController::class, "getAllAddresses"]);
            Route::post('/add_update_address/{id?}', [AddressController::class, "addOrUpdateAddress"]);
            Route::delete('/delete_address/{id}', [AddressController::class, "deleteAddress"]);

            // Notifications
            Route::get('/notifications/{id?}', [NotificationController::class, "getAllNotifications"]);
            Route::post('/add_update_notification/{id?}', [NotificationController::class, "addOrUpdateNotification"]);
            Route::post('/mark_notification_as_read/{id}', [NotificationController::class, "markAsRead"]);
            Route::delete('/delete_notification/{id}', [NotificationController::class, "deleteNotification"]);
        });

        // Vendor
        Route::group(["prefix" => "vendor"], function () {

            // Products
            Route::get('/products/{id?}', [VendorProductController::class, "getAllProducts"]);
            Route::post('/add_update_product/{id?}', [VendorProductController::class, "addOrUpdateProduct"]);
            Route::delete('/delete_product/{id}', [VendorProductController::class, "deleteProduct"]);

            // Orders
            Route::get('/orders/{id?}', [VendorOrderController::class, "getAllOrders"]);
            Route::post('/update_order_status/{id}', [VendorOrderController::class, "updateOrderStatus"]);

            // Store
            Route::get('/stores/{id?}', [StoreController::class, "getAllStores"]);
            Route::post('/add_update_store/{id?}', [StoreController::class, "addOrUpdateStore"]);
            Route::delete('/delete_store/{id}', [StoreController::class, "deleteStore"]);

            // Notifications
            Route::get('/notifications/{id?}', [VendorNotificationController::class, "getAllNotifications"]);
            Route::post('/add_update_notification/{id?}', [VendorNotificationController::class, "addOrUpdateNotification"]);
            Route::post('/mark_notification_as_read/{id}', [VendorNotificationController::class, "markAsRead"]);
            Route::delete('/delete_notification/{id}', [VendorNotificationController::class, "deleteNotification"]);

            Route::get('/dashboard', [VendorDashboardController::class, "getDashboardStats"]);
        });

        // Admin
        Route::group(["prefix" => "admin"], function () {

            // Dashboard
            Route::get('/dashboard', [DashboardController::class, "getDashboardStats"]);

            // Users
            Route::get('/users/{id?}', [UserController::class, "getAllUsers"]);
            Route::delete('/delete_user/{id}', [UserController::class, "deleteUser"]);

            // Stores
            Route::get('/stores/{id?}', [AdminStoreController::class, "getAllStores"]);
            Route::delete('/delete_store/{id}', [AdminStoreController::class, "deleteStore"]);

            // Products
            Route::get('/products/{id?}', [AdminProductController::class, "getAllProducts"]);
            Route::delete('/delete_product/{id}', [AdminProductController::class, "deleteProduct"]);

            // Orders
            Route::get('/orders/{id?}', [AdminOrderController::class, "getAllOrders"]);
        });
    });
});