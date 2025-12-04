import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/notification_service.dart';

class NotificationPreferencesProvider extends ChangeNotifier {
  static const _prefLeadUpdates = 'pref_lead_updates';
  static const _prefFollowUps = 'pref_follow_ups';
  static const _prefQuotations = 'pref_quotations';

  final NotificationService _notificationService;

  bool leadUpdates = true;
  bool followUps = true;
  bool quotations = true;

  NotificationPreferencesProvider(this._notificationService) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    leadUpdates = prefs.getBool(_prefLeadUpdates) ?? true;
    followUps = prefs.getBool(_prefFollowUps) ?? true;
    quotations = prefs.getBool(_prefQuotations) ?? true;
    notifyListeners();

    // Ensure topics reflect current settings
    await _syncTopics();
  }

  Future<void> setLeadUpdates(bool value) async {
    leadUpdates = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefLeadUpdates, value);
    notifyListeners();
    await _syncTopics();
  }

  Future<void> setFollowUps(bool value) async {
    followUps = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefFollowUps, value);
    notifyListeners();
    await _syncTopics();
  }

  Future<void> setQuotations(bool value) async {
    quotations = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefQuotations, value);
    notifyListeners();
    await _syncTopics();
  }

  Future<void> _syncTopics() async {
    if (leadUpdates) {
      await _notificationService.subscribeToTopic('lead_updates');
    } else {
      await _notificationService.unsubscribeFromTopic('lead_updates');
    }

    if (followUps) {
      await _notificationService.subscribeToTopic('follow_ups');
    } else {
      await _notificationService.unsubscribeFromTopic('follow_ups');
    }

    if (quotations) {
      await _notificationService.subscribeToTopic('quotations');
    } else {
      await _notificationService.unsubscribeFromTopic('quotations');
    }
  }
}
