<?php

namespace App\Services;

use App\Models\Store;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreService
{
    static function getAllStores($id = null)
    {
        if (!$id) {
            return Store::with('user')->get();
        }

        return Store::with('user')->find($id);
    }

    static function createOrUpdateStore($data, $store)
    {
        if (isset($data['base64']) && isset($data['file_name'])) {
            $base64String = $data['base64'];

            if (Str::contains($base64String, ';base64,')) {
                [$meta, $base64String] = explode(';base64,', $base64String);
            }

            $decoded = base64_decode($base64String);

            $filename = uniqid() . '_' . preg_replace('/\s+/', '_', $data['file_name']);
            $folder = 'store_logos';
            $fullPath = $folder . '/' . $filename;

            Storage::disk('public')->put($fullPath, $decoded);

            $store->logo = $fullPath;
        }

        $store->user_id = $data['user_id'] ?? $store->user_id;
        $store->name = $data['name'] ?? $store->name;
        $store->description = $data['description'] ?? $store->description;
        $store->phone = $data['phone'] ?? $store->phone;
        $store->rating = $data['rating'] ?? $store->rating ?? 0;
        $store->status = $data['status'] ?? $store->status;

        $store->save();

        return $store;
    }

    static function deleteStore($store)
    {
        return $store->delete();
    }
}