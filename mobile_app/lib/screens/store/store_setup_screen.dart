import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/store_service.dart';
import '../home/home_screen.dart';


class StoreSetupScreen extends StatefulWidget {
  const StoreSetupScreen({super.key});

  @override
  State<StoreSetupScreen> createState() => _StoreSetupScreenState();
}

class _StoreSetupScreenState extends State<StoreSetupScreen> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();

  final StoreService _storeService = StoreService();
  final ImagePicker _picker = ImagePicker();

  File? selectedImage;
  String? fileName;
  String? base64Image;
  bool isLoading = false;

  @override
  void dispose() {
    nameController.dispose();
    descriptionController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  Future<void> pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);

    if (image == null) return;

    final file = File(image.path);
    final bytes = await file.readAsBytes();
    final extension = image.name.split('.').last.toLowerCase();

    String mimeType = 'image/jpeg';
    if (extension == 'png') {
      mimeType = 'image/png';
    } else if (extension == 'jpg' || extension == 'jpeg') {
      mimeType = 'image/jpeg';
    }

    setState(() {
      selectedImage = file;
      fileName = image.name;
      base64Image = 'data:$mimeType;base64,${base64Encode(bytes)}';
    });
  }

  Future<void> handleCreateStore() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    final storeName = nameController.text.trim();
    final description = descriptionController.text.trim();
    final phone = phoneController.text.trim();

    if (user == null || user['id'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User session not found')),
      );
      return;
    }

    if (storeName.isEmpty || description.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    if (fileName == null || base64Image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a logo')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      await _storeService.createOrUpdateStore(
        userId: user['id'],
        name: storeName,
        description: description,
        phone: phone,
        fileName: fileName!,
        base64: base64Image!,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Store created successfully')),
      );

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create store: $e')),
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
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFE6E1E1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
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
                'Create your store',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: textDark,
                  fontFamily: 'Georgia',
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Set up your boutique presence and start selling on Vendi.',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.5,
                  color: textMuted,
                ),
              ),
              const SizedBox(height: 34),

              buildLabel('Store Name'),
              buildTextField(
                controller: nameController,
                hint: 'e.g. Nour Boutique',
              ),
              const SizedBox(height: 20),

              buildLabel('Description'),
              buildTextField(
                controller: descriptionController,
                hint: 'e.g. Elegant fashion store',
                maxLines: 4,
              ),
              const SizedBox(height: 20),

              buildLabel('Phone'),
              buildTextField(
                controller: phoneController,
                hint: 'e.g. 70123456',
              ),
              const SizedBox(height: 20),

              buildLabel('Store Logo'),
              GestureDetector(
                onTap: pickImage,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE6E1E1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: selectedImage == null
                      ? const Column(
                          children: [
                            Icon(Icons.add_photo_alternate_outlined,
                                size: 34, color: primary),
                            SizedBox(height: 10),
                            Text(
                              'Tap to select logo',
                              style: TextStyle(
                                color: textMuted,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        )
                      : Column(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.file(
                                selectedImage!,
                                height: 140,
                                width: 140,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              fileName ?? '',
                              style: const TextStyle(
                                color: textMuted,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                ),
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
                  onPressed: isLoading ? null : handleCreateStore,
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
                              'Create Store',
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