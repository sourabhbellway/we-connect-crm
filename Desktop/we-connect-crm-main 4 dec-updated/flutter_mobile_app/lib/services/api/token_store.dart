import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/env.dart' as env;

abstract class TokenStore {
  Future<String?> getToken();
  Future<void> saveToken(String token);
  Future<bool> refreshToken();
}

class SharedPrefsTokenStore implements TokenStore {
  static const _tokenKey = 'auth_token';

  @override
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  @override
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  @override
  Future<bool> refreshToken() async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final resp = await http.post(
        Uri.parse('${env.apiBaseUrl}/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body) as Map<String, dynamic>;
        final newToken = data['data']?['token'] as String?;
        if (newToken != null && newToken.isNotEmpty) {
          await saveToken(newToken);
          return true;
        }
      }
    } catch (_) {}
    return false;
  }
}
