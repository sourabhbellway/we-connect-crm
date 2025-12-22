// Environment configuration
// Use --dart-define to override at build/run time.
// Example:
// flutter run --dart-define=API_BASE_URL=https://your.api.com/api

library env;

const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3010/api',
);

const bool enableAnalytics = bool.fromEnvironment('ENABLE_ANALYTICS', defaultValue: false);
