import 'package:flutter/material.dart';
import '../../services/home_service.dart';
import '../cart/cart_screen.dart';
import '../notifications/notifications_screen.dart';
import '../products/product_detail_screen.dart';
import '../profile/profile_screen.dart';
import '../search/search_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final HomeService _homeService = HomeService();
  final TextEditingController searchController = TextEditingController();

  bool isLoading = true;
  String selectedCategory = 'All';
  String query = '';

  List<dynamic> products = [];
  List<String> categories = ['All'];

  @override
  void initState() {
    super.initState();
    loadHomeData();

    searchController.addListener(() {
      setState(() {
        query = searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  Future<void> loadHomeData() async {
    try {
      final fetchedProducts = await _homeService.getProducts();

      final categorySet = <String>{};

      for (final product in fetchedProducts) {
        final category = product['category']?.toString().trim();
        if (category != null && category.isNotEmpty) {
          categorySet.add(category);
        }
      }

      setState(() {
        products = fetchedProducts;
        categories = ['All', ...categorySet.toList()];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load home data: $e')),
      );
    }
  }

  String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    return 'http://127.0.0.1:8000/storage/$path';
  }

  List<dynamic> get filteredProducts {
    return products.where((product) {
      final name = product['name']?.toString().toLowerCase() ?? '';
      final description = product['description']?.toString().toLowerCase() ?? '';
      final category = product['category']?.toString() ?? '';
      final storeName =
          product['store']?['name']?.toString().toLowerCase() ?? '';

      final matchesCategory =
          selectedCategory == 'All' || category == selectedCategory;

      final matchesQuery = query.isEmpty ||
          name.contains(query) ||
          description.contains(query) ||
          category.toLowerCase().contains(query) ||
          storeName.contains(query);

      return matchesCategory && matchesQuery;
    }).toList();
  }

  IconData getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'cake':
      case 'cakes':
        return Icons.cake_outlined;
      case 'flower':
      case 'flowers':
        return Icons.local_florist_outlined;
      case 'candle':
      case 'candles':
        return Icons.emoji_objects_outlined;
      case 'dress':
      case 'dresses':
        return Icons.checkroom_outlined;
      default:
        return Icons.grid_view_rounded;
    }
  }

  Widget buildCategoryItem(String category) {
    final isSelected = selectedCategory == category;

    return GestureDetector(
      onTap: () {
  if (category == 'All') {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => const SearchScreen(),
      ),
    );
  } else {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => SearchScreen(
          initialCategory: category,
        ),
      ),
    );
  }
},
      child: Padding(
        padding: const EdgeInsets.only(right: 18),
        child: Column(
          children: [
            Container(
              width: 66,
              height: 66,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected
                    ? const Color(0xFFF6E3E3)
                    : const Color(0xFFF3EEEE),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFFD48383)
                      : Colors.transparent,
                  width: 1.6,
                ),
              ),
              child: Icon(
                getCategoryIcon(category),
                color: const Color(0xFF6E5454),
                size: 28,
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: 74,
              child: Text(
                category.toUpperCase(),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  letterSpacing: 1.2,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected
                      ? const Color(0xFFA25557)
                      : const Color(0xFF7D6B6B),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildProductCard(Map<String, dynamic> product) {
    final image = getImageUrl(product['image']?.toString());
    final name = product['name']?.toString() ?? '';
    final description = product['description']?.toString() ?? '';
    final price = product['price']?.toString() ?? '0';
    final category = product['category']?.toString() ?? '';
    final storeName = product['store']?['name']?.toString() ?? '';

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 220,
              width: double.infinity,
              color: const Color(0xFFF1ECEC),
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
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    category.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      letterSpacing: 1.2,
                      color: Color(0xFFA97B7C),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B2323),
                      fontFamily: 'Georgia',
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6E5C5C),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          storeName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF8C7C7C),
                          ),
                        ),
                      ),
                      Text(
                        '\$${double.tryParse(price)?.toStringAsFixed(2) ?? price}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFA25557),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildBottomNavBar() {
    return Container(
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
          const _NavItem(
            icon: Icons.home_filled,
            label: 'HOME',
            selected: true,
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
          GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CartScreen()),
              );
            },
            child: const _NavItem(
              icon: Icons.shopping_cart_outlined,
              label: 'CART',
              selected: false,
            ),
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
    );
  }

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF8F5F5);
    const primary = Color(0xFFA25557);
    const accent = Color(0xFFC69C9D);
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF9A8C8C);
    const inputBg = Color(0xFFEAE4E4);

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: buildBottomNavBar(),
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator(color: primary))
            : RefreshIndicator(
                color: primary,
                onRefresh: loadHomeData,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(24, 14, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Spacer(),
                          GestureDetector(
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const NotificationsScreen(),
                                ),
                              );
                            },
                            child: const Icon(
                              Icons.notifications_none,
                              color: primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const Text(
                        'Curated Treasures',
                        style: TextStyle(
                          fontSize: 28,
                          height: 1.2,
                          fontWeight: FontWeight.w700,
                          color: textDark,
                          fontFamily: 'Georgia',
                        ),
                      ),
                      const Text(
                        'Delivered to You.',
                        style: TextStyle(
                          fontSize: 28,
                          height: 1.2,
                          fontWeight: FontWeight.w700,
                          color: accent,
                          fontFamily: 'Georgia',
                        ),
                      ),
                      const SizedBox(height: 28),
                      Container(
                        height: 56,
                        decoration: BoxDecoration(
                          color: inputBg,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: TextField(
                          controller: searchController,
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            prefixIcon: Icon(
                              Icons.search,
                              color: Color(0xFF7D6B6B),
                            ),
                            hintText: 'Search for products, categories, stores...',
                            hintStyle: TextStyle(
                              color: Color(0xFFA79E9E),
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 34),
                      const Text(
                        'CATEGORIES',
                        style: TextStyle(
                          fontSize: 13,
                          letterSpacing: 2.4,
                          fontWeight: FontWeight.w600,
                          color: textMuted,
                        ),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        height: 108,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: categories.map(buildCategoryItem).toList(),
                        ),
                      ),
                      const SizedBox(height: 28),
                      const Text(
                        'Products',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: textDark,
                          fontFamily: 'Georgia',
                        ),
                      ),
                      const SizedBox(height: 18),
                      if (filteredProducts.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(top: 30),
                          child: Center(
                            child: Text(
                              'No products found',
                              style: TextStyle(
                                fontSize: 15,
                                color: Color(0xFF8B7B7B),
                              ),
                            ),
                          ),
                        )
                      else
                        ...filteredProducts.map(
                          (product) => buildProductCard(
                            Map<String, dynamic>.from(product),
                          ),
                        ),
                    ],
                  ),
                ),
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