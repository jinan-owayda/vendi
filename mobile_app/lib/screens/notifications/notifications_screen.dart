import 'package:flutter/material.dart';
import '../../services/notifications_service.dart';
import '../home/home_screen.dart';
import '../cart/cart_screen.dart';
import '../profile/profile_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationsService _service = NotificationsService();

  List<dynamic> notifications = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    try {
      final data = await _service.getNotifications();

      setState(() {
        notifications = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load notifications: $e')),
      );
    }
  }

  Future<void> markAsRead(int id) async {
    await _service.markAsRead(id);
    await loadNotifications();
  }

  List<dynamic> todayNotifications() {
    final now = DateTime.now();

    return notifications.where((n) {
      final date = DateTime.parse(n['created_at']).toLocal();
      return date.day == now.day &&
          date.month == now.month &&
          date.year == now.year;
    }).toList();
  }

  List<dynamic> yesterdayNotifications() {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));

    return notifications.where((n) {
      final date = DateTime.parse(n['created_at']).toLocal();
      return date.day == yesterday.day &&
          date.month == yesterday.month &&
          date.year == yesterday.year;
    }).toList();
  }

  List<dynamic> olderNotifications() {
    final now = DateTime.now();
    final yesterday = now.subtract(const Duration(days: 1));

    return notifications.where((n) {
      final date = DateTime.parse(n['created_at']).toLocal();

      final isToday = date.day == now.day &&
          date.month == now.month &&
          date.year == now.year;

      final isYesterday = date.day == yesterday.day &&
          date.month == yesterday.month &&
          date.year == yesterday.year;

      return !isToday && !isYesterday;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    const primary = Color(0xFFA25557);
    const background = Color(0xFFF8F5F5);

    final today = todayNotifications();
    final yesterday = yesterdayNotifications();
    final older = olderNotifications();

    return Scaffold(
      backgroundColor: background,
      bottomNavigationBar: _buildNavBar(),
      body: SafeArea(
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(color: primary),
              )
            : Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.arrow_back, color: primary),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Notifications',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Georgia',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 25),
                    Expanded(
                      child: notifications.isEmpty
                          ? const Center(
                              child: Text(
                                'No notifications yet',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Color(0xFF6B6464),
                                ),
                              ),
                            )
                          : ListView(
                              children: [
                                if (today.isNotEmpty) ...[
                                  const Text(
                                    'Today',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Georgia',
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ...today.map((n) => notificationCard(n)),
                                  const SizedBox(height: 24),
                                ],
                                if (yesterday.isNotEmpty) ...[
                                  const Text(
                                    'Yesterday',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Georgia',
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ...yesterday.map((n) => notificationCard(n)),
                                  const SizedBox(height: 24),
                                ],
                                if (older.isNotEmpty) ...[
                                  const Text(
                                    'Older',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Georgia',
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ...older.map((n) => notificationCard(n)),
                                ],
                              ],
                            ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget notificationCard(dynamic n) {
    final isRead = n['is_read'] == true;

    return GestureDetector(
      onTap: () {
        if (!isRead) {
          markAsRead(n['id']);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 80,
              decoration: BoxDecoration(
                color: isRead ? Colors.transparent : const Color(0xFFD88A8A),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(width: 14),
            const CircleAvatar(
              radius: 22,
              backgroundColor: Color(0xFFF3EEEE),
              child: Icon(
                Icons.notifications_none,
                color: Color(0xFFA25557),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    n['title'] ?? '',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    n['message'] ?? '',
                    style: const TextStyle(
                      color: Color(0xFF6B6464),
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            if (!isRead)
              const CircleAvatar(
                radius: 4,
                backgroundColor: Color(0xFFD88A8A),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavBar() {
    return Container(
      height: 92,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          navItem(Icons.home_filled, 'HOME', false, () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const HomeScreen()),
            );
          }),
          navItem(Icons.search, 'SEARCH', false, () {}),
          navItem(Icons.shopping_cart_outlined, 'CART', false, () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const CartScreen()),
            );
          }),
          navItem(Icons.person_outline, 'PROFILE', false, () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            );
          }),
        ],
      ),
    );
  }

  Widget navItem(
    IconData icon,
    String label,
    bool selected,
    VoidCallback onTap,
  ) {
    const primary = Color(0xFFA25557);

    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: selected ? primary : Colors.grey),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: selected ? primary : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}