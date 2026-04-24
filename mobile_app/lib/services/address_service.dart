import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AddressService {
  static const String addressKey = 'vendi_address';

  Future<Map<String, dynamic>> addAddress({
    required int userId,
    required String city,
    required String area,
    required String street,
    required String building,
    required String phone,
  }) async {
    final response = await ApiService.dio.post(
      '/customer/add_update_address',
      data: {
        'user_id': userId,
        'city': city,
        'area': area,
        'street': street,
        'building': building,
        'phone': phone,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to save address');
    }

    final payload = Map<String, dynamic>.from(data['payload']);
    await saveAddressLocally(payload);

    return payload;
  }

  Future<void> saveAddressLocally(Map<String, dynamic> address) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(addressKey, jsonEncode(address));
  }

  Future<Map<String, dynamic>?> getSavedAddress() async {
    final prefs = await SharedPreferences.getInstance();
    final addressString = prefs.getString(addressKey);

    if (addressString == null || addressString.isEmpty) return null;

    return Map<String, dynamic>.from(jsonDecode(addressString));
  }

  Future<void> clearSavedAddress() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(addressKey);
  }
}