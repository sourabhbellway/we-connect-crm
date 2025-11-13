import 'dart:async';
import 'package:dio/dio.dart';
import '../../config/env.dart' as env;
import 'token_store.dart';

class ApiClient {
  final Dio dio;
  final TokenStore _tokenStore;
  bool _isRefreshing = false;

  ApiClient({TokenStore? tokenStore})
      : _tokenStore = tokenStore ?? SharedPrefsTokenStore(),
        dio = Dio(
          BaseOptions(
            baseUrl: env.apiBaseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 20),
            headers: {
              'Content-Type': 'application/json',
            },
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStore.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (DioException err, handler) async {
          if (_shouldAttemptRefresh(err)) {
            try {
              final refreshed = await _refreshToken();
              if (refreshed) {
                final token = await _tokenStore.getToken();
                final opts = err.requestOptions;
                opts.headers['Authorization'] = token != null ? 'Bearer $token' : null;
                final cloneReq = await dio.fetch(opts);
                return handler.resolve(cloneReq);
              }
            } catch (_) {
              // fallthrough to reject
            }
          }
          handler.next(err);
        },
      ),
    );
  }

  bool _shouldAttemptRefresh(DioException err) {
    final status = err.response?.statusCode;
    final isUnauthorized = status == 401;
    final isLogin = err.requestOptions.path.contains('/auth/login');
    return isUnauthorized && !isLogin && !_isRefreshing;
  }

  Future<bool> _refreshToken() async {
    if (_isRefreshing) return false;
    _isRefreshing = true;
    try {
      final ok = await _tokenStore.refreshToken();
      return ok;
    } finally {
      _isRefreshing = false;
    }
  }

  // Convenience helpers
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? query}) =>
      dio.get<T>(path, queryParameters: query);
  Future<Response<T>> post<T>(String path, {Object? data}) => dio.post<T>(path, data: data);
  Future<Response<T>> put<T>(String path, {Object? data}) => dio.put<T>(path, data: data);
  Future<Response<T>> delete<T>(String path, {Object? data}) => dio.delete<T>(path, data: data);
}
