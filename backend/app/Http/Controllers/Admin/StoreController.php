<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Services\AdminService;
use App\Http\Controllers\Controller;

class StoreController extends Controller
{
    public function getAllStores($id = null)
    {
        try {
            $stores = AdminService::getAllStores($id);
            return $this->responseJSON($stores);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve stores.", 500);
        }
    }

    public function deleteStore($id)
    {
        try {
            $store = AdminService::getAllStores($id);

            if (!$store) {
                return $this->responseJSON(null, "Store not found.", 404);
            }

            $deleted = AdminService::deleteStore($store);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete store.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting store.", 500);
        }
    }
}