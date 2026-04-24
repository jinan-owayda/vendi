import 'api_service.dart';

class CheckoutService {
  Future<Map<String, dynamic>> placeOrder({
    required int addressId,
    required double totalAmount,
    required String paymentMethod,
  }) async {
    final response = await ApiService.dio.post(
      '/customer/place_order',
      data: {
        'address_id': addressId,
        'total_amount': totalAmount,
        'payment_method': paymentMethod,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to place order');
    }

    return Map<String, dynamic>.from(data['payload']);
  }

  Future<Map<String, dynamic>> addOrderItem({
    required int orderId,
    required int productId,
    required int vendorId,
    required String productName,
    required int quantity,
    required double unitPrice,
    required double totalPrice,
  }) async {
    final response = await ApiService.dio.post(
      '/customer/add_update_order_item',
      data: {
        'order_id': orderId,
        'product_id': productId,
        'vendor_id': vendorId,
        'product_name': productName,
        'quantity': quantity,
        'unit_price': unitPrice,
        'total_price': totalPrice,
      },
    );

    final data = response.data;

    if (data['status'] != 'success') {
      throw Exception('Failed to add order item');
    }

    return Map<String, dynamic>.from(data['payload']);
  }
}