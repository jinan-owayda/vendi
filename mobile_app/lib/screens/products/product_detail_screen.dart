import 'package:flutter/material.dart';
import '../../services/cart_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({
    super.key,
    required this.product,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final CartService _cartService = CartService();

  int quantity = 1;
  bool isLoading = false;

  String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    return 'http://127.0.0.1:8000/storage/$path';
  }

  int get stock {
    return int.tryParse(widget.product['stock_quantity']?.toString() ?? '0') ?? 0;
  }

  double get price {
    return double.tryParse(widget.product['price']?.toString() ?? '0') ?? 0.0;
  }

  Future<void> handleAddToCart() async {
    if (stock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This product is out of stock')),
      );
      return;
    }

    if (quantity > stock) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You cannot add more than the available stock')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      await _cartService.addToCart(
        productId: widget.product['id'],
        quantity: quantity,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Added to cart successfully')),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add to cart: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final image = getImageUrl(widget.product['image']?.toString());
    final name = widget.product['name']?.toString() ?? '';
    final description = widget.product['description']?.toString() ?? '';
    final category = widget.product['category']?.toString() ?? '';

    const background = Color(0xFFF8F5F5);
    const primary = Color(0xFFA25557);
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF7F6D6D);
    const soft = Color(0xFFF0EAEA);

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SizedBox(
          height: 58,
          child: ElevatedButton(
            onPressed: isLoading || stock <= 0 ? null : handleAddToCart,
            style: ElevatedButton.styleFrom(
              backgroundColor: primary,
              disabledBackgroundColor: const Color(0xFFC8B8B8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.3,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    stock <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart • \$${price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.arrow_back, color: primary),
              ),
              const SizedBox(height: 8),
              Container(
                height: 300,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: soft,
                  borderRadius: BorderRadius.circular(28),
                ),
                clipBehavior: Clip.antiAlias,
                child: image.isEmpty
                    ? const Icon(
                        Icons.image_outlined,
                        size: 70,
                        color: Color(0xFFA79E9E),
                      )
                    : Image.network(
                        image,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) {
                          return const Icon(
                            Icons.broken_image_outlined,
                            size: 70,
                            color: Color(0xFFA79E9E),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 22),
              Text(
                name,
                style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'Georgia',
                  color: textDark,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.5,
                  color: textMuted,
                ),
              ),
              const SizedBox(height: 18),
              _InfoChip(label: 'Category', value: category),
              const SizedBox(height: 24),
              Row(
                children: [
                  const Text(
                    'Quantity',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: textDark,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: quantity > 1
                              ? () {
                                  setState(() {
                                    quantity--;
                                  });
                                }
                              : null,
                          icon: const Icon(Icons.remove),
                        ),
                        Text(
                          '$quantity',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: textDark,
                          ),
                        ),
                        IconButton(
                          onPressed: quantity < stock
                              ? () {
                                  setState(() {
                                    quantity++;
                                  });
                                }
                              : () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'You cannot add more than the available stock',
                                      ),
                                    ),
                                  );
                                },
                          icon: const Icon(Icons.add),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Text(
                      'Total',
                      style: TextStyle(
                        fontSize: 16,
                        color: textMuted,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '\$${(price * quantity).toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;

  const _InfoChip({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF6E5C5C),
          ),
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }
}