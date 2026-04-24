import 'package:flutter/material.dart';
import '../../services/home_service.dart';
import '../cart/cart_screen.dart';
import '../home/home_screen.dart';
import '../products/product_detail_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';

class SearchScreen extends StatefulWidget {
  final String? initialCategory;

  const SearchScreen({
    super.key,
    this.initialCategory,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final HomeService _homeService = HomeService();
  final TextEditingController searchController = TextEditingController();

  bool isLoading = true;

  List<dynamic> products = [];
  List<dynamic> bestSellers = [];

  List<String> categories = ['All Items'];
  late String selectedCategory;
  String query = '';

  @override
  void initState() {
    super.initState();
    selectedCategory = widget.initialCategory ?? 'All Items';
    loadProducts();

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

  Future<void> loadProducts() async {
    try {
      final fetchedProducts = await _homeService.getProducts();
      final fetchedBestSellers = await _homeService.getBestSellerProducts();

      fetchedProducts.sort(
        (a, b) => DateTime.parse(b['created_at'])
            .compareTo(DateTime.parse(a['created_at'])),
      );

      final categorySet = <String>{};

      for (final product in fetchedProducts) {
        final category = product['category']?.toString().trim();

        if (category != null && category.isNotEmpty) {
          categorySet.add(category);
        }
      }

      setState(() {
        products = fetchedProducts;
        bestSellers = fetchedBestSellers;
        categories = ['All Items', ...categorySet.toList()];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load products: $e')),
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
          selectedCategory == 'All Items' || category == selectedCategory;

      final matchesQuery = query.isEmpty ||
          name.contains(query) ||
          description.contains(query) ||
          category.toLowerCase().contains(query) ||
          storeName.contains(query);

      return matchesCategory && matchesQuery;
    }).toList();
  }

  List<dynamic> get filteredBestSellers {
    return bestSellers.where((item) {
      final product = item['product'];
      if (product == null) return false;

      final name = product['name']?.toString().toLowerCase() ?? '';
      final description = product['description']?.toString().toLowerCase() ?? '';
      final category = product['category']?.toString() ?? '';

      final matchesCategory =
          selectedCategory == 'All Items' || category == selectedCategory;

      final matchesQuery = query.isEmpty ||
          name.contains(query) ||
          description.contains(query) ||
          category.toLowerCase().contains(query);

      return matchesCategory && matchesQuery;
    }).toList();
  }

  List<dynamic> get featuredProducts {
    return filteredProducts.take(4).toList();
  }

  Widget buildCategoryChip(String category) {
    final selected = selectedCategory == category;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedCategory = category;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFA25557) : const Color(0xFFECE6E6),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          category,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xFF6E5C5C),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget buildGridCard(Map<String, dynamic> product) {
    final image = getImageUrl(product['image']?.toString());
    final name = product['name']?.toString() ?? '';
    final category = product['category']?.toString() ?? '';
    final price = product['price']?.toString() ?? '0';

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
        ),
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  width: double.infinity,
                  color: const Color(0xFFF1ECEC),
                  child: image.isEmpty
                      ? const Icon(
                          Icons.image_outlined,
                          color: Color(0xFFA79E9E),
                          size: 36,
                        )
                      : Image.network(
                          image,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) {
                            return const Icon(
                              Icons.broken_image_outlined,
                              color: Color(0xFFA79E9E),
                              size: 36,
                            );
                          },
                        ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              category.toUpperCase(),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w700,
                color: Color(0xFFA97B7C),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                fontFamily: 'Georgia',
                color: Color(0xFF231F20),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '\$${double.tryParse(price)?.toStringAsFixed(2) ?? price}',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Color(0xFFA25557),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildWideCard(Map<String, dynamic> product, {int? totalPurchased}) {
    final image = getImageUrl(product['image']?.toString());
    final name = product['name']?.toString() ?? '';
    final description = product['description']?.toString() ?? '';
    final price = product['price']?.toString() ?? '0';

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(product: product),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 18),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
        ),
        child: Row(
          children: [
            Expanded(
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (totalPurchased != null)
        Text(
          '$totalPurchased purchased',
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Color(0xFFA97B7C),
          ),
        ),
      const SizedBox(height: 3),
      Text(
        name,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          fontFamily: 'Georgia',
          color: Color(0xFF231F20),
        ),
      ),
      const SizedBox(height: 5),
      Text(
        description,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 13,
          color: Color(0xFF7F6D6D),
        ),
      ),
      const SizedBox(height: 8),
      Text(
        '\$${double.tryParse(price)?.toStringAsFixed(2) ?? price}',
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: Color(0xFFA25557),
        ),
      ),
    ],
  ),
),
            const SizedBox(width: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 104,
                height: 104,
                color: const Color(0xFFF1ECEC),
                child: image.isEmpty
                    ? const Icon(
                        Icons.image_outlined,
                        color: Color(0xFFA79E9E),
                        size: 34,
                      )
                    : Image.network(
                        image,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) {
                          return const Icon(
                            Icons.broken_image_outlined,
                            color: Color(0xFFA79E9E),
                            size: 34,
                          );
                        },
                      ),
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
          const _NavItem(
            icon: Icons.search,
            label: 'SEARCH',
            selected: true,
          ),
          GestureDetector(
            onTap: () {
              Navigator.of(context).pushReplacement(
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
    const textDark = Color(0xFF231F20);
    const textMuted = Color(0xFF7F6D6D);
    const inputBg = Color(0xFFEAE4E4);

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: buildBottomNavBar(),
      body: SafeArea(
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(color: primary),
              )
            : RefreshIndicator(
                color: primary,
                onRefresh: loadProducts,
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

                      Container(
                        height: 54,
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
                            hintText: 'Store name or item...',
                            hintStyle: TextStyle(
                              color: Color(0xFFA79E9E),
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),
                      SizedBox(
                        height: 42,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: categories.map(buildCategoryChip).toList(),
                        ),
                      ),
                      const SizedBox(height: 34),

                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'You May Also Like',
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'Georgia',
                                    color: textDark,
                                  ),
                                ),
                                SizedBox(height: 6),
                                Text(
                                  'Curated selections based on your unique taste.',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      if (filteredProducts.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(top: 40),
                          child: Center(
                            child: Text(
                              'No products found',
                              style: TextStyle(
                                fontSize: 15,
                                color: textMuted,
                              ),
                            ),
                          ),
                        )
                      else ...[
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: featuredProducts.length,
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 18,
                            crossAxisSpacing: 18,
                            childAspectRatio: 0.67,
                          ),
                          itemBuilder: (context, index) {
                            return buildGridCard(
                              Map<String, dynamic>.from(featuredProducts[index]),
                            );
                          },
                        ),
                        const SizedBox(height: 40),
                      ],

                      const Text(
                        'Best Sellers',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'Georgia',
                          color: textDark,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Most purchased items from the Vendi community.',
                        style: TextStyle(
                          fontSize: 14,
                          color: textMuted,
                        ),
                      ),
                      const SizedBox(height: 18),

                      if (filteredBestSellers.isEmpty)
                        const Text(
                          'No best sellers yet',
                          style: TextStyle(
                            fontSize: 15,
                            color: textMuted,
                          ),
                        )
                      else
                        ...filteredBestSellers.map((item) {
                          final product =
                              Map<String, dynamic>.from(item['product']);
                          final totalPurchased =
                              int.tryParse(item['total_purchased'].toString());

                          return buildWideCard(
                            product,
                            totalPurchased: totalPurchased,
                          );
                        }),
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