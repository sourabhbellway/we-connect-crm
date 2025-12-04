import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart' as env;

class AuthService extends ChangeNotifier {
  static String get _baseUrl => env.apiBaseUrl;
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  
  bool _isAuthenticated = false;
  String? _token;
  Map<String, dynamic>? _user;
  
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  
  AuthService() {
    _loadAuthData();
  }
  
  Future<void> _loadAuthData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_tokenKey);
      final userString = prefs.getString(_userKey);
      
      if (_token != null && userString != null) {
        _user = json.decode(userString);
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      print('Error loading auth data: $e');
    }
  }
  
  Future<bool> login(String email, String password) async {
    try {
      print('Attempting login to: $_baseUrl/auth/login');
      print('Email: $email');
      
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );
      
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          _token = data['data']['accessToken'];
          _user = data['data']['user'];
          _isAuthenticated = true;
          
          print('Login successful! Token: ${_token?.substring(0, 20)}...');
          
          // Save to local storage
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_tokenKey, _token!);
          await prefs.setString(_userKey, json.encode(_user));
          
          notifyListeners();
          return true;
        } else {
          print('Login failed: success = false');
        }
      } else {
        print('Login failed with status: ${response.statusCode}');
      }
      
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }
  
  Future<void> logout() async {
    try {
      // Call logout endpoint
      if (_token != null) {
        await http.post(
          Uri.parse('$_baseUrl/auth/logout'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_token',
          },
        );
      }
    } catch (e) {
      print('Logout API error: $e');
    } finally {
      // Clear local data regardless of API call success
      _token = null;
      _user = null;
      _isAuthenticated = false;
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userKey);
      
      notifyListeners();
    }
  }
  
  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }
  
  Future<bool> refreshToken() async {
    try {
      if (_token == null) return false;
      
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/refresh'),
        headers: getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          _token = data['data']['token'];
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_tokenKey, _token!);
          
          notifyListeners();
          return true;
        }
      }
      
      return false;
    } catch (e) {
      print('Token refresh error: $e');
      return false;
    }
  }
  
  Future<bool> checkAuthStatus() async {
    if (_token == null) return false;
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/auth/me'),
        headers: getAuthHeaders(),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          _user = data['data']['user'];
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_userKey, json.encode(_user));
          
          notifyListeners();
          return true;
        }
      }
      
      // Token is invalid, logout
      await logout();
      return false;
    } catch (e) {
      print('Auth status check error: $e');
      return false;
    }
  }
}
