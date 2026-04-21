<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    static function getCustomerProducts($id = null)
    {
        self::deleteExpiredProducts();

        if (!$id) {
            return Product::with(['vendor', 'store'])
                ->where('moderation_status', 'approved')
                ->get();
        }

        return Product::with(['vendor', 'store'])
            ->where('moderation_status', 'approved')
            ->find($id);
    }

    static function getVendorProducts($vendor_id, $id = null)
    {
        self::deleteExpiredProducts();

        if (!$id) {
            return Product::with(['vendor', 'store'])
                ->where('vendor_id', $vendor_id)
                ->get();
        }

        return Product::with(['vendor', 'store'])
            ->where('vendor_id', $vendor_id)
            ->find($id);
    }

    static function getAdminProducts($id = null)
    {
        self::deleteExpiredProducts();

        if (!$id) {
            return Product::with(['vendor', 'store'])->get();
        }

        return Product::with(['vendor', 'store'])->find($id);
    }

    static function createOrUpdateProduct($data, $product)
    {
        if (isset($data['base64']) && isset($data['file_name'])) {
            $base64String = $data['base64'];

            if (Str::contains($base64String, ';base64,')) {
                [$meta, $base64String] = explode(';base64,', $base64String);
            }

            $decoded = base64_decode($base64String);

            $filename = uniqid() . '_' . preg_replace('/\s+/', '_', $data['file_name']);
            $folder = 'product_images';
            $fullPath = $folder . '/' . $filename;

            Storage::disk('public')->put($fullPath, $decoded);

            $product->image = $fullPath;
        }

        $product->vendor_id = $data['vendor_id'] ?? $product->vendor_id;
        $product->store_id = $data['store_id'] ?? $product->store_id;
        $product->name = $data['name'] ?? $product->name;
        $product->description = $data['description'] ?? $product->description;
        $product->category = $data['category'] ?? $product->category;
        $product->sku = $data['sku'] ?? $product->sku;
        $product->price = $data['price'] ?? $product->price;
        $product->stock_quantity = $data['stock_quantity'] ?? $product->stock_quantity;
        $product->status = $data['status'] ?? $product->status;

        $moderationResponse = Http::post('http://127.0.0.1:8001/moderate/product', [
            'name' => $product->name,
            'description' => $product->description,
            'category' => $product->category,
            'image_path' => $product->image ? storage_path('app/public/' . $product->image) : null,
        ]);

        if ($moderationResponse->successful()) {
            $moderationData = $moderationResponse->json();

            $product->moderation_status = $moderationData['moderation_status'] ?? 'pending';
            $product->moderation_reason = $moderationData['moderation_reason'] ?? null;
        } else {
            $product->moderation_status = 'pending';
            $product->moderation_reason = 'Moderation service unavailable';
        }

        if (in_array($product->moderation_status, ['flagged', 'rejected'])) {
            $product->expires_at = now()->addHour();
        } else {
            $product->expires_at = null;
        }

        $product->save();

        if (in_array($product->moderation_status, ['flagged', 'rejected'])) {
            Notification::create([
                'user_id' => $product->vendor_id,
                'title' => 'Product Moderation Alert',
                'message' => 'Your product "' . $product->name . '" was marked as ' . $product->moderation_status . '. It will be deleted after 1 hour if not corrected.',
                'type' => 'system',
                'is_read' => false,
            ]);
        }

        return $product;
    }

    static function deleteProduct($product)
    {
        return $product->delete();
    }

    static function deleteExpiredProducts()
    {
        Product::whereIn('moderation_status', ['flagged', 'rejected'])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->delete();
    }
}