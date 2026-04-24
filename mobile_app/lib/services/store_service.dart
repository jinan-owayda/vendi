import 'api_service.dart';

class StoreService {
  Future<Map<String, dynamic>> createOrUpdateStore({
    required int userId,
    required String name,
    required String description,
    required String phone,
    required String fileName,
    required String base64,
  }) async {
    final response = await ApiService.dio.post(
      '/vendor/add_update_store',
      data: {
        'user_id': userId,
        'name': name,
        'description': description,
        'phone': phone,
        'status': 'active',
        'file_name': fileName,
        'base64': base64,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Store creation failed');
    }

    return Map<String, dynamic>.from(data['payload']);
  }
}