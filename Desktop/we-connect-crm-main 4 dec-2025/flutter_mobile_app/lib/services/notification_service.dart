import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'call_service.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  CallService? _callService;
  
  Future<void> initialize(CallService callService) async {
    _callService = callService;
    
    // Initialize local notifications
    await _initializeLocalNotifications();
    
    // Initialize Firebase messaging
    await _initializeFirebaseMessaging();
    
    // Get and save FCM token
    await _saveToken();
  }
  
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
    
    // Create notification channels for Android
    await _createNotificationChannels();
  }
  
  Future<void> _createNotificationChannels() async {
    const callChannel = AndroidNotificationChannel(
      'call_notifications',
      'Call Notifications',
      description: 'Notifications for incoming call requests',
      importance: Importance.high,
      sound: RawResourceAndroidNotificationSound('call_notification'),
    );
    
    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(callChannel);
  }
  
  Future<void> _initializeFirebaseMessaging() async {
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle when app is opened from a terminated state via notification
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Handle initial message when app is launched from terminated state
    RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }
  
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('Received foreground message: ${message.messageId}');
    
    if (message.data['type'] == 'call_request') {
      await _showCallNotification(message);
    } else {
      await _showGeneralNotification(message);
    }
  }
  
  Future<void> _showCallNotification(RemoteMessage message) async {
    final leadName = message.data['leadName'] ?? 'Unknown Lead';
    final phoneNumber = message.data['phoneNumber'] ?? '';
    final callLogId = message.data['callLogId'];
    
    const androidDetails = AndroidNotificationDetails(
      'call_notifications',
      'Call Notifications',
      channelDescription: 'Notifications for incoming call requests',
      importance: Importance.high,
      priority: Priority.high,
      category: AndroidNotificationCategory.call,
      fullScreenIntent: true,
      autoCancel: false,
      ongoing: true,
      actions: [
        AndroidNotificationAction(
          'call_action',
          'Call Now',
          icon: DrawableResourceAndroidBitmap('ic_call'),
        ),
        AndroidNotificationAction(
          'dismiss_action',
          'Dismiss',
          icon: DrawableResourceAndroidBitmap('ic_close'),
        ),
      ],
    );
    
    const iosDetails = DarwinNotificationDetails(
      categoryIdentifier: 'CALL_CATEGORY',
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'call_notification.aiff',
    );
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      int.tryParse(callLogId ?? '0') ?? 0,
      'Call Request from $leadName',
      'Tap to call $phoneNumber',
      payload: json.encode({
        'type': 'call_request',
        'callLogId': callLogId,
        'phoneNumber': phoneNumber,
        'leadName': leadName,
      }),
      notificationDetails,
    );
  }
  
  Future<void> _showGeneralNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'general_notifications',
      'General Notifications',
      channelDescription: 'General app notifications',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      message.notification?.title ?? 'WeConnect CRM',
      message.notification?.body ?? 'You have a new notification',
      notificationDetails,
      payload: json.encode(message.data),
    );
  }
  
  void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      final data = json.decode(response.payload!);
      _handleNotificationAction(data, response.actionId);
    }
  }
  
  void _handleNotificationTap(RemoteMessage message) {
    _handleNotificationAction(message.data, null);
  }
  
  Future<void> _handleNotificationAction(Map<String, dynamic> data, String? actionId) async {
    if (data['type'] == 'call_request') {
      final phoneNumber = data['phoneNumber'];
      final callLogId = data['callLogId'];
      
      if (actionId == 'call_action' || actionId == null) {
        // User wants to make the call
        await _callService?.makeCall(phoneNumber, callLogId);
      }
      // For 'dismiss_action', we just dismiss the notification (default behavior)
    }
  }
  
  Future<void> _saveToken() async {
    try {
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', token);
        print('FCM Token saved: $token');
        
        // You could also send this token to your backend here
        // await _sendTokenToServer(token);
      }
    } catch (e) {
      print('Error saving FCM token: $e');
    }
  }
  
  Future<String?> getToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print('Error getting FCM token: $e');
      return null;
    }
  }
  
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      print('Subscribed to topic: $topic');
    } catch (e) {
      print('Error subscribing to topic: $e');
    }
  }
  
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      print('Unsubscribed from topic: $topic');
    } catch (e) {
      print('Error unsubscribing from topic: $e');
    }
  }
  
  Future<void> requestPermission() async {
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    print('Notification permission status: ${settings.authorizationStatus}');
  }
  
  Future<void> clearAllNotifications() async {
    await _localNotifications.cancelAll();
  }
  
  Future<void> clearNotification(int id) async {
    await _localNotifications.cancel(id);
  }
}
