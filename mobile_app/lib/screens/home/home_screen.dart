import 'package:flutter/material.dart';
import '../../services/home_service.dart';
import '../store/store_detail_screen.dart';
import '../cart/cart_screen.dart';
import '../notifications/notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final HomeService _homeService = HomeService();

  bool isLoading = true;
  String selectedCategory = 'All';

  List<dynamic> products = [];
  List<dynamic> stores = [];
  List<String> categories = ['All'];

  @override
  void initState() {
    super.initState();
    loadHomeData();
  }

  Future<void> loadHomeData() async {
    try {
      final fetchedProducts = await _homeService.getProducts();
      final fetchedStores = await _homeService.getStores();

      final categorySet = <String>{};
      for (final product in fetchedProducts) {
        final category = product['category']?.toString().trim();
        if (category != null && category.isNotEmpty) {
          categorySet.add(category);
        }
      }

      setState(() {
        products = fetchedProducts;
        stores = fetchedStores;
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
    if (path == null || path.isEmpty) {
      return '';
    }
    return 'http://10.0.2.2:8000/storage/$path';
  }

  List<dynamic> get filteredStores {
    if (selectedCategory == 'All') return stores;

    final matchingStoreIds = products
        .where((product) => product['category'] == selectedCategory)
        .map((product) => product['store_id'])
        .toSet();

    return stores.where((store) => matchingStoreIds.contains(store['id'])).toList();
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
        setState(() {
          selectedCategory = category;
        });
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
                color: isSelected ? const Color(0xFFF6E3E3) : const Color(0xFFF3EEEE),
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

    Widget buildStoreCard(Map<String, dynamic> store) {
    final logo = getImageUrl(store['logo']?.toString());
    final rating = double.tryParse(store['rating']?.toString() ?? '0') ?? 0.0;

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => StoreDetailScreen(
              storeId: store['id'],
            ),
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
              child: logo.isEmpty
                  ? const Icon(
                      Icons.storefront_outlined,
                      size: 60,
                      color: Color(0xFFA79E9E),
                    )
                  : Image.network(
                      logo,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
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
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          store['name']?.toString() ?? '',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2B2323),
                            fontFamily: 'Georgia',
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          store['description']?.toString() ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF6E5C5C),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF6F1F1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: Color(0xFFA25557),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          rating.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF6A5858),
                          ),
                        ),
                      ],
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
    const accent = Color(0xFFC69C9D);
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF9A8C8C);
    const inputBg = Color(0xFFEAE4E4);

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
            const _NavItem(
              icon: Icons.home_filled,
              label: 'HOME',
              selected: true,
            ),
            const _NavItem(
              icon: Icons.search,
              label: 'SEARCH',
              selected: false,
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
            const _NavItem(
              icon: Icons.person_outline,
              label: 'ACCOUNT',
              selected: false,
            ),
          ],
        ),
      ),
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
                        child: const TextField(
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            prefixIcon: Icon(Icons.search, color: Color(0xFF7D6B6B)),
                            hintText: 'Search for stores or categories...',
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
                      Row(
                        children: const [
                          Text(
                            'Trend Stores',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: textDark,
                              fontFamily: 'Georgia',
                            ),
                          ),
                          Spacer(),
                          Text(
                            'View Lookbook',
                            style: TextStyle(
                              fontSize: 14,
                              color: primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      if (filteredStores.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(top: 30),
                          child: Center(
                            child: Text(
                              'No stores found for this category',
                              style: TextStyle(
                                fontSize: 15,
                                color: Color(0xFF8B7B7B),
                              ),
                            ),
                          ),
                        )
                      else
                        ...filteredStores.map(
                          (store) => buildStoreCard(
                            Map<String, dynamic>.from(store),
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