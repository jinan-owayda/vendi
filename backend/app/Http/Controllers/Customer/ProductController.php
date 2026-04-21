<?php

namespace App\Http\Controllers\Customer;

use Exception;
use App\Services\ProductService;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    public function getAllProducts($id = null)
    {
        try {
            $products = ProductService::getCustomerProducts($id);
            return $this->responseJSON($products);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve products.", 500);
        }
    }
}