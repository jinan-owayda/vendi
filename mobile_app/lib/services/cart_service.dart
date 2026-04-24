import 'api_service.dart';

class CartService {
  Future<Map<String, dynamic>> addToCart({
    required int productId,
    required int quantity,
  }) async {
    final response = await ApiService.dio.post(
      '/customer/add_update_cart',
      data: {
        'product_id': productId,
        'quantity': quantity,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to add item to cart');
    }

    return Map<String, dynamic>.from(data['payload']);
  }

  Future<Map<String, dynamic>> updateCartItem({
    required int cartItemId,
    required int quantity,
  }) async {
    final response = await ApiService.dio.post(
      '/customer/add_update_cart/$cartItemId',
      data: {
        'quantity': quantity,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to update cart item');
    }

    return Map<String, dynamic>.from(data['payload']);
  }

  Future<List<dynamic>> getCartItems() async {
    final response = await ApiService.dio.get('/customer/cart');
    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to load cart');
    }

    return List<dynamic>.from(data['payload']);
  }

  Future<void> deleteCartItem(int cartItemId) async {
    final response = await ApiService.dio.delete(
      '/customer/delete_cart_item/$cartItemId',
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to delete cart item');
    }
  }

  Future<void> clearCart() async {
    final response = await ApiService.dio.delete('/customer/clear_cart');
    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to clear cart');
    }
  }

  Future<double> getCartTotal() async {
    final response = await ApiService.dio.get('/customer/cart_total');
    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to load cart total');
    }

    final payload = data['payload'];

    if (payload is num) {
      return payload.toDouble();
    }

    if (payload is String) {
      return double.tryParse(payload) ?? 0.0;
    }

    if (payload is Map<String, dynamic>) {
      final total = payload['total'] ?? payload['cart_total'] ?? 0;
      if (total is num) return total.toDouble();
      return double.tryParse(total.toString()) ?? 0.0;
    }

    return 0.0;
  }
}