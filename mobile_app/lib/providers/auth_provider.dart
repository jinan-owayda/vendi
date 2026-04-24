import 'package:flutter/material.dart';
import '../services/auth_service.dart';


class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  String? _errorMessage;
String? get errorMessage => _errorMessage;

  Map<String, dynamic>? _user;
  bool _isLoading = false;
  bool _isLoggedIn = false;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;

  Future<void> loadUserFromStorage() async {
    _isLoading = true;
    notifyListeners();

    final savedUser = await _authService.getSavedUser();
    final loggedIn = await _authService.isLoggedIn();

    _user = savedUser;
    _isLoggedIn = loggedIn;

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login({
  required String email,
  required String password,
}) async {
  try {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final userData = await _authService.login(
      email: email,
      password: password,
    );

    _user = userData;
    _isLoggedIn = true;

    _isLoading = false;
    notifyListeners();

    return true;
  } catch (e) {
    _isLoading = false;
    _errorMessage = e.toString().replaceAll('Exception: ', '');
    notifyListeners();
    return false;
  }
}

Future<bool> resetPassword({
  required String email,
  required String password,
}) async {
  try {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    await _authService.resetPassword(
      email: email,
      password: password,
    );

    _isLoading = false;
    notifyListeners();

    return true;
  } catch (e) {
    _isLoading = false;
    _errorMessage = e.toString().replaceAll('Exception: ', '');
    notifyListeners();
    return false;
  }
}

  Future<Map<String, dynamic>?> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final userData = await _authService.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );

      _user = userData;
      _isLoggedIn = true;

      _isLoading = false;
      notifyListeners();

      return userData;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    await _authService.logout();
    _user = null;
    _isLoggedIn = false;

    _isLoading = false;
    notifyListeners();
  }
}