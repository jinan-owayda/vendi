<?php

namespace App\Http\Controllers\Vendor;

use Exception;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\ProductService;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    public function getAllProducts($id = null)
    {
        try {
            $products = ProductService::getVendorProducts(auth()->id(), $id);
            return $this->responseJSON($products);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve products.", 500);
        }
    }

    public function addOrUpdateProduct(Request $request, $id = null)
    {
        try {
            $product = new Product;

            if ($id) {
                $product = ProductService::getVendorProducts(auth()->id(), $id);

                if (!$product) {
                    return $this->responseJSON(null, "Product not found.", 404);
                }
            }

            $data = $request->all();
            $data['vendor_id'] = auth()->id();

            $product = ProductService::createOrUpdateProduct($data, $product);

            if ($product) {
                return $this->responseJSON($product);
            }

            return $this->responseJSON(null, "Failed to save product.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving product.", 500);
        }
    }

    public function deleteProduct($id)
    {
        try {
            $product = ProductService::getVendorProducts(auth()->id(), $id);

            if (!$product) {
                return $this->responseJSON(null, "Product not found.", 404);
            }

            $deleted = ProductService::deleteProduct($product);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete product.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting product.", 500);
        }
    }
}