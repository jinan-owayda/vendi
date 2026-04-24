import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  static const String tokenKey = 'vendi_token';
  static const String userKey = 'vendi_user';

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await ApiService.dio.post(
      '/guest/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Login failed');
    }

    final payload = Map<String, dynamic>.from(data['payload']);
    await saveUserSession(payload);

    return payload;
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await ApiService.dio.post(
      '/guest/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Registration failed');
    }

    final payload = Map<String, dynamic>.from(data['payload']);
    await saveUserSession(payload);

    return payload;
  }

  Future<void> saveUserSession(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setString(tokenKey, userData['token'] ?? '');
    await prefs.setString(userKey, jsonEncode(userData));
  }

  Future<Map<String, dynamic>?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString(userKey);

    if (userString == null || userString.isEmpty) return null;

    return Map<String, dynamic>.from(jsonDecode(userString));
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(tokenKey);
    await prefs.remove(userKey);
  }
}