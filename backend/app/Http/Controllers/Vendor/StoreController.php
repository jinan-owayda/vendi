<?php

namespace App\Http\Controllers\Vendor;

use Exception;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Services\StoreService;
use App\Http\Controllers\Controller;

class StoreController extends Controller
{
    public function getAllStores($id = null)
    {
        try {
            $stores = StoreService::getAllStores($id);
            return $this->responseJSON($stores);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve stores.", 500);
        }
    }

    public function addOrUpdateStore(Request $request, $id = null)
    {
        try {
            $store = new Store;

            if ($id) {
                $store = StoreService::getAllStores($id);

                if (!$store) {
                    return $this->responseJSON(null, "Store not found.", 404);
                }
            }

            $data = $request->all();
            $store = StoreService::createOrUpdateStore($data, $store);

            if ($store) {
                return $this->responseJSON($store);
            }

            return $this->responseJSON(null, "Failed to save store.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving store.", 500);
        }
    }

    public function deleteStore($id)
    {
        try {
            $store = StoreService::getAllStores($id);

            if (!$store) {
                return $this->responseJSON(null, "Store not found.", 404);
            }

            $deleted = StoreService::deleteStore($store);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete store.", 400);

        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting store.", 500);
        }
    }
}