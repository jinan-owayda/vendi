import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _scaleAnimation = Tween<double>(begin: 0.96, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.03),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ),
    );

    _controller.forward();

    Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _blurBlob({
    required double width,
    required double height,
    required Color color,
    double? top,
    double? left,
    double? right,
    double? bottom,
    required double radius,
  }) {
    return Positioned(
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const background = Color(0xFFF3D9D8);
    const primary = Color(0xFFA86769);
    const deep = Color(0xFF92585B);

    const textPrimary = Color(0xFF7A474A);
    const textSecondary = Color(0xFF9C676A);
    const textBottom = Color(0xFF8F5A5D);

    const whiteSoft = Color(0xFFFDF7F7);

    return Scaffold(
      backgroundColor: background,
      body: Stack(
        children: [
          _blurBlob(
            width: 220,
            height: 340,
            color: Colors.white.withOpacity(0.20),
            top: 80,
            left: -40,
            radius: 90,
          ),
          _blurBlob(
            width: 180,
            height: 280,
            color: primary.withOpacity(0.14),
            bottom: 120,
            left: -10,
            radius: 80,
          ),
          _blurBlob(
            width: 190,
            height: 300,
            color: deep.withOpacity(0.12),
            bottom: 40,
            right: -10,
            radius: 85,
          ),
          SafeArea(
            child: Center(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: ScaleTransition(
                    scale: _scaleAnimation,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 112,
                            height: 112,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: primary.withOpacity(0.10),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.16),
                                width: 1.1,
                              ),
                            ),
                            child: Center(
                              child: Container(
                                width: 72,
                                height: 72,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(24),
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      whiteSoft.withOpacity(0.16),
                                      deep.withOpacity(0.08),
                                    ],
                                  ),
                                ),
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    Transform.rotate(
                                      angle: -0.14,
                                      child: Container(
                                        width: 18,
                                        height: 52,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(20),
                                          color: Colors.white.withOpacity(0.12),
                                        ),
                                      ),
                                    ),
                                    Transform.translate(
                                      offset: const Offset(8, 0),
                                      child: Container(
                                        width: 18,
                                        height: 52,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(20),
                                          color: Colors.white.withOpacity(0.07),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 34),
                          const Text(
                            'Vendi',
                            style: TextStyle(
                              fontSize: 52,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                              letterSpacing: -1,
                              fontFamily: 'Georgia',
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'THE DIGITAL CURATOR',
                            style: TextStyle(
                              fontSize: 14,
                              letterSpacing: 4.2,
                              color: textSecondary,
                              fontWeight: FontWeight.w300,
                            ),
                          ),
                          const SizedBox(height: 34),
                          const _AnimatedDots(),
                          const SizedBox(height: 90),
                          const Text(
                            'PREMIUM MARKETPLACE • BEIRUT',
                            style: TextStyle(
                              fontSize: 11,
                              letterSpacing: 1.4,
                              color: textBottom,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedDots extends StatefulWidget {
  const _AnimatedDots();

  @override
  State<_AnimatedDots> createState() => _AnimatedDotsState();
}

class _AnimatedDotsState extends State<_AnimatedDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  double _opacityFor(int index) {
    final value = (_controller.value - index * 0.18).clamp(0.0, 1.0);
    return 0.35 + (value * 0.65);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            3,
            (index) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 5),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF9A6668).withOpacity(_opacityFor(index)),
              ),
            ),
          ),
        );
      },
    );
  }
}