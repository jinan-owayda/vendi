import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class NotificationsService {
  static const String baseUrl = 'http://127.0.0.1:8000/api/v0.1/customer';

  final AuthService _authService = AuthService();

  Future<List<dynamic>> getNotifications() async {
    final token = await _authService.getToken();

    final response = await http.get(
      Uri.parse('$baseUrl/notifications'),
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 && data['status'] == 'success') {
      return List<dynamic>.from(data['payload'] ?? []);
    } else {
      throw Exception(data['message'] ?? 'Failed to load notifications');
    }
  }

  Future<void> markAsRead(int id) async {
    final token = await _authService.getToken();

    final response = await http.post(
      Uri.parse('$baseUrl/mark_notification_as_read/$id'),
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200 || data['status'] != 'success') {
      throw Exception(data['message'] ?? 'Failed to mark notification as read');
    }
  }
}