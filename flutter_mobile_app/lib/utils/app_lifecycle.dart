import 'package:flutter/widgets.dart';
import '../services/auth_service.dart';

class AppLifecycle with WidgetsBindingObserver {
  AppLifecycle._();

  static void setup({required AuthService authService}) {
    WidgetsBinding.instance.addObserver(_LifecycleObserver(authService));
  }
}

class _LifecycleObserver with WidgetsBindingObserver {
  final AuthService _authService;
  _LifecycleObserver(this._authService);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // On resume, verify auth and refresh user data
      _authService.checkAuthStatus();
    }
  }
}
