<?php

namespace App\Http\Controllers\Customer;

use Exception;
use Illuminate\Http\Request;
use App\Models\Address;
use App\Services\AddressService;
use App\Http\Controllers\Controller;

class AddressController extends Controller
{
    public function getAllAddresses($id = null)
    {
        try {
            $addresses = AddressService::getAllAddresses($id);
            return $this->responseJSON($addresses);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Failed to retrieve addresses.", 500);
        }
    }

    public function addOrUpdateAddress(Request $request, $id = null)
    {
        try {
            $address = new Address;

            if ($id) {
                $address = AddressService::getAllAddresses($id);

                if (!$address) {
                    return $this->responseJSON(null, "Address not found.", 404);
                }
            }

            $data = $request->all();
            $address = AddressService::createOrUpdateAddress($data, $address);

            if ($address) {
                return $this->responseJSON($address);
            }

            return $this->responseJSON(null, "Failed to save address.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while saving address.", 500);
        }
    }

    public function deleteAddress($id)
    {
        try {
            $address = AddressService::getAllAddresses($id);

            if (!$address) {
                return $this->responseJSON(null, "Address not found.", 404);
            }

            $deleted = AddressService::deleteAddress($address);

            if ($deleted) {
                return $this->responseJSON(null);
            }

            return $this->responseJSON(null, "Failed to delete address.", 400);
        } catch (Exception $e) {
            return $this->responseJSON(null, "Server error while deleting address.", 500);
        }
    }
}