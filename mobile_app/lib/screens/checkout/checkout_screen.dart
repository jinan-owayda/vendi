import 'package:flutter/material.dart';
import '../../services/address_service.dart';
import '../../services/cart_service.dart';
import '../../services/checkout_service.dart';
import '../home/home_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final AddressService _addressService = AddressService();
  final CartService _cartService = CartService();
  final CheckoutService _checkoutService = CheckoutService();

  Map<String, dynamic>? address;
  List<dynamic> cartItems = [];
  double cartTotal = 0.0;

  bool isLoading = true;
  bool isPlacingOrder = false;
  String paymentMethod = 'cash';

  @override
  void initState() {
    super.initState();
    loadCheckoutData();
  }

  Future<void> loadCheckoutData() async {
    try {
      final savedAddress = await _addressService.getSavedAddress();
      final items = await _cartService.getCartItems();
      final total = await _cartService.getCartTotal();

      setState(() {
        address = savedAddress;
        cartItems = items;
        cartTotal = total;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load checkout: $e')),
      );
    }
  }

  Future<void> handlePlaceOrder() async {
    if (address == null || address!['id'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No saved address found')),
      );
      return;
    }

    if (cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty')),
      );
      return;
    }

    setState(() {
      isPlacingOrder = true;
    });

    try {
      final order = await _checkoutService.placeOrder(
        addressId: address!['id'],
        totalAmount: cartTotal,
        paymentMethod: paymentMethod,
      );

      final int orderId = order['id'];

      for (final rawItem in cartItems) {
        final item = Map<String, dynamic>.from(rawItem);
        final product = Map<String, dynamic>.from(item['product']);

        final int quantity = item['quantity'] ?? 1;
        final double unitPrice =
            double.tryParse(product['price']?.toString() ?? '0') ?? 0.0;

        await _checkoutService.addOrderItem(
          orderId: orderId,
          productId: product['id'],
          vendorId: product['vendor_id'],
          productName: product['name']?.toString() ?? '',
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice * quantity,
        );
      }

      await _cartService.clearCart();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order placed: ${order['order_number']}')),
      );

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to place order: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isPlacingOrder = false;
        });
      }
    }
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          fontFamily: 'Georgia',
          color: Color(0xFF231F20),
        ),
      ),
    );
  }

  Widget infoBox({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF8F5F5);
    const primary = Color(0xFFA25557);
    const textMuted = Color(0xFF7F6D6D);

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(color: primary),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 14, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                          icon: const Icon(Icons.arrow_back, color: primary),
                        ),
                        const Text(
                          'Checkout',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Georgia',
                            color: Color(0xFF231F20),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    sectionTitle('Delivery Address'),
                    if (address == null)
                      infoBox(
                        child: const Text(
                          'No saved address found.',
                          style: TextStyle(
                            fontSize: 15,
                            color: textMuted,
                          ),
                        ),
                      )
                    else
                      infoBox(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${address!['building']}, ${address!['street']}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF231F20),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${address!['area']}, ${address!['city']}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: textMuted,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Phone: ${address!['phone']}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 28),
                    sectionTitle('Payment Method'),
                    infoBox(
                      child: Row(
                        children: [
                          Radio<String>(
                            value: 'cash',
                            groupValue: paymentMethod,
                            activeColor: primary,
                            onChanged: (value) {
                              setState(() {
                                paymentMethod = value!;
                              });
                            },
                          ),
                          const Text(
                            'Cash on Delivery',
                            style: TextStyle(
                              fontSize: 15,
                              color: Color(0xFF231F20),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),
                    sectionTitle('Order Summary'),
                    infoBox(
                      child: Column(
                        children: [
                          ...cartItems.map((rawItem) {
                            final item = Map<String, dynamic>.from(rawItem);
                            final product =
                                Map<String, dynamic>.from(item['product']);
                            final quantity = item['quantity'] ?? 1;
                            final unitPrice = double.tryParse(
                                  product['price']?.toString() ?? '0',
                                ) ??
                                0.0;

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${product['name']} x$quantity',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Color(0xFF231F20),
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '\$${(unitPrice * quantity).toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF231F20),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                          const Divider(),
                          Row(
                            children: [
                              const Text(
                                'Total',
                                style: TextStyle(
                                  fontSize: 18,
                                  color: textMuted,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '\$${cartTotal.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: primary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 30),
                    SizedBox(
                      width: double.infinity,
                      height: 58,
                      child: ElevatedButton(
                        onPressed: isPlacingOrder ? null : handlePlaceOrder,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        child: isPlacingOrder
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.3,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Confirm Order',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}