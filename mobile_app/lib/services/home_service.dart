import 'api_service.dart';

class HomeService {
  Future<List<dynamic>> getProducts() async {
    final response = await ApiService.dio.get('/customer/products');
    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to load products');
    }

    return List<dynamic>.from(data['payload']);
  }

  Future<List<dynamic>> getStores() async {
    final response = await ApiService.dio.get('/vendor/stores');
    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to load stores');
    }

    return List<dynamic>.from(data['payload']);
  }
}