import 'package:flutter/material.dart';
import '../../services/home_service.dart';
import '../../services/store_service.dart';
import '../products/product_detail_screen.dart';

class StoreDetailScreen extends StatefulWidget {
  final int storeId;

  const StoreDetailScreen({
    super.key,
    required this.storeId,
  });

  @override
  State<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends State<StoreDetailScreen> {
  final HomeService _homeService = HomeService();
  final StoreService _storeService = StoreService();

  bool isLoading = true;
  bool isRating = false;

  Map<String, dynamic>? store;
  List<dynamic> products = [];

  @override
  void initState() {
    super.initState();
    loadStoreData();
  }

  Future<void> loadStoreData() async {
    try {
      final stores = await _homeService.getStores();
      final allProducts = await _homeService.getProducts();

      final selectedStore = stores.firstWhere(
        (s) => s['id'] == widget.storeId,
      );

      final storeProducts = allProducts.where((product) {
        return product['store_id'] == widget.storeId;
      }).toList();

      setState(() {
        store = Map<String, dynamic>.from(selectedStore);
        products = storeProducts;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load store: $e')),
      );
    }
  }

  Future<void> submitRating(int userRating) async {
    if (store == null) return;

    final oldRating =
        double.tryParse(store!['rating']?.toString() ?? '0') ?? 0.0;

    final calculatedRating = oldRating <= 0
        ? userRating.toDouble()
        : ((oldRating + userRating) / 2);

    setState(() {
      isRating = true;
    });

    try {
      await _storeService.updateStoreRating(
        storeId: widget.storeId,
        rating: calculatedRating,
      );

      setState(() {
        store!['rating'] = calculatedRating.toStringAsFixed(2);
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Thank you for rating this store')),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit rating: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isRating = false;
        });
      }
    }
  }

  void openRatingDialog() {
    int selectedRating = 5;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFFF8F5F5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Text(
                'Rate this store',
                style: TextStyle(
                  fontFamily: 'Georgia',
                  fontWeight: FontWeight.w700,
                ),
              ),
              content: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starValue = index + 1;
                  final selected = starValue <= selectedRating;

                  return IconButton(
                    onPressed: () {
                      setDialogState(() {
                        selectedRating = starValue;
                      });
                    },
                    icon: Icon(
                      selected ? Icons.star : Icons.star_border,
                      color: const Color(0xFFA25557),
                      size: 32,
                    ),
                  );
                }),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Color(0xFFA25557)),
                  ),
                ),
                ElevatedButton(
                  onPressed: isRating
                      ? null
                      : () async {
                          Navigator.of(context).pop();
                          await submitRating(selectedRating);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFA25557),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Submit',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String getImageUrl(String? path) {
    if (path == null || path.isEmpty) {
      return '';
    }
    return 'http://127.0.0.1:8000/storage/$path';
  }

  Widget buildProductCard(Map<String, dynamic> product) {
    final image = getImageUrl(product['image']?.toString());

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 180,
              width: double.infinity,
              color: const Color(0xFFF3EEEE),
              child: image.isEmpty
                  ? const Icon(
                      Icons.image_outlined,
                      size: 60,
                      color: Color(0xFFA79E9E),
                    )
                  : Image.network(
                      image,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) {
                        return const Icon(
                          Icons.broken_image_outlined,
                          size: 60,
                          color: Color(0xFFA79E9E),
                        );
                      },
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Georgia',
                      color: Color(0xFF2B2323),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    product['description'] ?? '',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6E5C5C),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '\$${product['price']}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFA25557),
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

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF8F5F5);
    const primary = Color(0xFFA25557);
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF8C7C7C);

    if (isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: primary),
        ),
      );
    }

    if (store == null) {
      return const Scaffold(
        body: Center(
          child: Text('Store not found'),
        ),
      );
    }

    final logo = getImageUrl(store!['logo']?.toString());
    final rating =
        double.tryParse(store!['rating']?.toString() ?? '0') ?? 0.0;

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: SingleChildScrollView(
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
                  const Spacer(),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                height: 240,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(26),
                ),
                clipBehavior: Clip.antiAlias,
                child: logo.isEmpty
                    ? const Icon(
                        Icons.storefront_outlined,
                        size: 70,
                        color: Color(0xFFA79E9E),
                      )
                    : Image.network(
                        logo,
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
                store!['name'] ?? '',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'Georgia',
                  color: textDark,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                store!['description'] ?? '',
                style: const TextStyle(
                  fontSize: 15,
                  color: textMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.star, color: primary, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    rating.toStringAsFixed(2),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: textDark,
                    ),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: isRating ? null : openRatingDialog,
                    icon: const Icon(Icons.star_border, color: primary),
                    label: const Text(
                      'Rate Store',
                      style: TextStyle(color: primary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              const Text(
                'Products',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'Georgia',
                  color: textDark,
                ),
              ),
              const SizedBox(height: 18),
              ...products.map(
                (product) => buildProductCard(
                  Map<String, dynamic>.from(product),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}