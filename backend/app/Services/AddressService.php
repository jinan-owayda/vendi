<?php

namespace App\Services;

use App\Models\Address;

class AddressService
{
    static function getAllAddresses($id = null)
    {
        if (!$id) {
            return Address::with('user')->get();
        }

        return Address::with('user')->find($id);
    }

    static function createOrUpdateAddress($data, $address)
    {
        $address->user_id = $data['user_id'] ?? $address->user_id;
        $address->city = $data['city'] ?? $address->city;
        $address->area = $data['area'] ?? $address->area;
        $address->street = $data['street'] ?? $address->street;
        $address->building = $data['building'] ?? $address->building;
        $address->phone = $data['phone'] ?? $address->phone;

        $address->save();

        return $address;
    }

    static function deleteAddress($address)
    {
        return $address->delete();
    }
}