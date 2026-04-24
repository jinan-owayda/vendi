import 'package:flutter/material.dart';
import '../../services/cart_service.dart';
import '../home/home_screen.dart';
import '../profile/profile_screen.dart';
import '../checkout/checkout_screen.dart';
import '../search/search_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final CartService _cartService = CartService();

  bool isLoading = true;
  bool isProcessing = false;

  List<dynamic> cartItems = [];
  double cartTotal = 0.0;

  @override
  void initState() {
    super.initState();
    loadCart();
  }

  Future<void> loadCart() async {
    try {
      final items = await _cartService.getCartItems();
      final total = await _cartService.getCartTotal();

      setState(() {
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
        SnackBar(content: Text('Failed to load cart: $e')),
      );
    }
  }

  Future<void> updateQuantity({
    required int cartItemId,
    required int quantity,
  }) async {
    if (quantity < 1) return;

    setState(() {
      isProcessing = true;
    });

    try {
      await _cartService.updateCartItem(
        cartItemId: cartItemId,
        quantity: quantity,
      );
      await loadCart();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update quantity: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isProcessing = false;
        });
      }
    }
  }

  Future<void> removeItem(int cartItemId) async {
    setState(() {
      isProcessing = true;
    });

    try {
      await _cartService.deleteCartItem(cartItemId);
      await loadCart();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Item removed from cart')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to remove item: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isProcessing = false;
        });
      }
    }
  }

  Future<void> clearCart() async {
    setState(() {
      isProcessing = true;
    });

    try {
      await _cartService.clearCart();
      await loadCart();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cart cleared')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to clear cart: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isProcessing = false;
        });
      }
    }
  }

  String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    return 'http://127.0.0.1:8000/storage/$path';
  }

  double getItemPrice(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map<String, dynamic>) {
      return double.tryParse(product['price']?.toString() ?? '0') ?? 0.0;
    }
    return 0.0;
  }

  int getItemStock(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map<String, dynamic>) {
      return int.tryParse(product['stock_quantity']?.toString() ?? '0') ?? 0;
    }
    return 0;
  }

  String getItemName(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map<String, dynamic>) {
      return product['name']?.toString() ?? '';
    }
    return 'Product';
  }

  String getItemDescription(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map<String, dynamic>) {
      return product['description']?.toString() ?? '';
    }
    return '';
  }

  String getItemImage(Map<String, dynamic> item) {
    final product = item['product'];
    if (product is Map<String, dynamic>) {
      return getImageUrl(product['image']?.toString());
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF8F5F5);
    const primary = Color(0xFFA25557);
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF7F6D6D);

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: Container(
        height: 92,
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(color: Color(0xFFE3DADA)),
          ),
          borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            GestureDetector(
              onTap: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const HomeScreen()),
                );
              },
              child: const _NavItem(
                icon: Icons.home_filled,
                label: 'HOME',
                selected: false,
              ),
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const SearchScreen()),
                );
              },
              child: const _NavItem(
                icon: Icons.search,
                label: 'SEARCH',
                selected: false,
              ),
            ),
            const _NavItem(
              icon: Icons.shopping_cart_outlined,
              label: 'CART',
              selected: true,
            ),
            GestureDetector(
              onTap: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                );
              },
              child: const _NavItem(
                icon: Icons.person_outline,
                label: 'ACCOUNT',
                selected: false,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(color: primary),
              )
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 14, 20, 10),
                    child: Row(
                      children: [
                        const Expanded(
                          child: Text(
                            '',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'Georgia',
                              color: textDark,
                            ),
                          ),
                        ),
                        if (cartItems.isNotEmpty)
                          TextButton(
                            onPressed: isProcessing ? null : clearCart,
                            child: const Text(
                              'Clear',
                              style: TextStyle(color: primary),
                            ),
                          )
                        else
                          const SizedBox(width: 48),
                      ],
                    ),
                  ),
                  Expanded(
                    child: cartItems.isEmpty
                        ? const Center(
                            child: Text(
                              'Your cart is empty',
                              style: TextStyle(
                                fontSize: 16,
                                color: textMuted,
                              ),
                            ),
                          )
                        : RefreshIndicator(
                            color: primary,
                            onRefresh: loadCart,
                            child: ListView.builder(
                              padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
                              itemCount: cartItems.length,
                              itemBuilder: (context, index) {
                                final item =
                                    Map<String, dynamic>.from(cartItems[index]);

                                final image = getItemImage(item);
                                final name = getItemName(item);
                                final description = getItemDescription(item);
                                final price = getItemPrice(item);
                                final quantity = item['quantity'] ?? 1;
                                final cartItemId = item['id'];
                                final stock = getItemStock(item);

                                return Container(
                                  margin: const EdgeInsets.only(bottom: 18),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(22),
                                  ),
                                  padding: const EdgeInsets.all(14),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(16),
                                        child: Container(
                                          width: 88,
                                          height: 88,
                                          color: const Color(0xFFF1ECEC),
                                          child: image.isEmpty
                                              ? const Icon(
                                                  Icons.image_outlined,
                                                  color: Color(0xFFA79E9E),
                                                )
                                              : Image.network(
                                                  image,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (_, __, ___) {
                                                    return const Icon(
                                                      Icons.broken_image_outlined,
                                                      color: Color(0xFFA79E9E),
                                                    );
                                                  },
                                                ),
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              name,
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.w700,
                                                fontFamily: 'Georgia',
                                                color: textDark,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              description,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: textMuted,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              'Stock: $stock',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF9A8C8C),
                                              ),
                                            ),
                                            const SizedBox(height: 10),
                                            Text(
                                              '\$${price.toStringAsFixed(2)}',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w700,
                                                color: primary,
                                              ),
                                            ),
                                            const SizedBox(height: 10),
                                            Row(
                                              children: [
                                                Container(
                                                  decoration: BoxDecoration(
                                                    color:
                                                        const Color(0xFFF5F0F0),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            14),
                                                  ),
                                                  child: Row(
                                                    children: [
                                                      IconButton(
                                                        onPressed: isProcessing
                                                            ? null
                                                            : () =>
                                                                updateQuantity(
                                                                  cartItemId:
                                                                      cartItemId,
                                                                  quantity:
                                                                      quantity -
                                                                          1,
                                                                ),
                                                        icon: const Icon(
                                                          Icons.remove,
                                                          size: 18,
                                                        ),
                                                      ),
                                                      Text(
                                                        '$quantity',
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                      ),
                                                      IconButton(
                                                        onPressed: isProcessing
                                                            ? null
                                                            : () {
                                                                if (stock <=
                                                                    0) {
                                                                  ScaffoldMessenger.of(
                                                                          context)
                                                                      .showSnackBar(
                                                                    const SnackBar(
                                                                      content: Text(
                                                                          'This item is out of stock'),
                                                                    ),
                                                                  );
                                                                  return;
                                                                }

                                                                if (quantity >=
                                                                    stock) {
                                                                  ScaffoldMessenger.of(
                                                                          context)
                                                                      .showSnackBar(
                                                                    const SnackBar(
                                                                      content: Text(
                                                                          'You cannot add more than the available stock'),
                                                                    ),
                                                                  );
                                                                  return;
                                                                }

                                                                updateQuantity(
                                                                  cartItemId:
                                                                      cartItemId,
                                                                  quantity:
                                                                      quantity +
                                                                          1,
                                                                );
                                                              },
                                                        icon: const Icon(
                                                          Icons.add,
                                                          size: 18,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                const Spacer(),
                                                IconButton(
                                                  onPressed: isProcessing
                                                      ? null
                                                      : () => removeItem(
                                                            cartItemId,
                                                          ),
                                                  icon: const Icon(
                                                    Icons.delete_outline,
                                                    color: primary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                  ),
                  Container(
                    padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    child: Column(
                      children: [
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
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                color: primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: cartItems.isEmpty
                                ? null
                                : () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            const CheckoutScreen(),
                                      ),
                                    );
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                            ),
                            child: const Text(
                              'Proceed to Checkout',
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
                ],
              ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
  });

  @override
  Widget build(BuildContext context) {
    const primary = Color(0xFFA25557);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: selected ? const Color(0xFFE5A7A7) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            icon,
            color: selected ? Colors.white : const Color(0xFF8A8484),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: selected ? primary : const Color(0xFF9A9494),
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}