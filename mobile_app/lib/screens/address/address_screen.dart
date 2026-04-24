import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/address_service.dart';
import '../home/home_screen.dart';

class AddressScreen extends StatefulWidget {
  const AddressScreen({super.key});

  @override
  State<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends State<AddressScreen> {
  final AddressService _addressService = AddressService();

  final TextEditingController cityController = TextEditingController();
  final TextEditingController areaController = TextEditingController();
  final TextEditingController streetController = TextEditingController();
  final TextEditingController buildingController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();

  bool isLoading = false;

  @override
  void dispose() {
    cityController.dispose();
    areaController.dispose();
    streetController.dispose();
    buildingController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  Future<void> handleSaveAddress() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    final city = cityController.text.trim();
    final area = areaController.text.trim();
    final street = streetController.text.trim();
    final building = buildingController.text.trim();
    final phone = phoneController.text.trim();

    if (user == null || user['id'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User session not found')),
      );
      return;
    }

    if (city.isEmpty ||
        area.isEmpty ||
        street.isEmpty ||
        building.isEmpty ||
        phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      await _addressService.addAddress(
        userId: user['id'],
        city: city,
        area: area,
        street: street,
        building: building,
        phone: phone,
      );

      if (!mounted) return;

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save address: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Widget buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF2B2B2B),
        ),
      ),
    );
  }

  Widget buildTextField({
    required String hint,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFE6E1E1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(
            color: Color(0xFFA79E9E),
            fontSize: 16,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 18,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF7F3F3);
    const primary = Color(0xFFA25557);
    const primaryLight = Color(0xFFD07C7F);
    const textDark = Color(0xFF1E1E1E);
    const textMuted = Color(0xFF6E5C5C);

    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 14, 24, 30),
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
                    'Vendi',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Add your address',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: textDark,
                  fontFamily: 'Georgia',
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'We need your delivery details before you start shopping.',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.5,
                  color: textMuted,
                ),
              ),
              const SizedBox(height: 34),

              buildLabel('City'),
              buildTextField(
                hint: 'e.g. Beirut',
                controller: cityController,
              ),
              const SizedBox(height: 20),

              buildLabel('Area'),
              buildTextField(
                hint: 'e.g. Hamra',
                controller: areaController,
              ),
              const SizedBox(height: 20),

              buildLabel('Street'),
              buildTextField(
                hint: 'e.g. Makdessi Street',
                controller: streetController,
              ),
              const SizedBox(height: 20),

              buildLabel('Building'),
              buildTextField(
                hint: 'e.g. Blue Tower',
                controller: buildingController,
              ),
              const SizedBox(height: 20),

              buildLabel('Phone'),
              buildTextField(
                hint: 'e.g. 70123456',
                controller: phoneController,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 30),

              Container(
                height: 62,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [primary, primaryLight],
                  ),
                  borderRadius: BorderRadius.circular(31),
                  boxShadow: [
                    BoxShadow(
                      color: primary.withOpacity(0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: isLoading ? null : handleSaveAddress,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    disabledBackgroundColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(31),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Save Address',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward, color: Colors.white),
                          ],
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