import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart' as env;

class CallService {
  static String get _baseUrl => env.apiBaseUrl;
  
  Future<void> makeCall(String phoneNumber, [String? callLogId]) async {
    try {
      // Check phone permission
      if (!await _hasPhonePermission()) {
        await _requestPhonePermission();
      }
      
      // Update call log status to RINGING if callLogId is provided
      if (callLogId != null) {
        await _updateCallLogStatus(callLogId, 'RINGING');
      }
      
      // Launch phone dialer
      final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
      
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
        
        // Update call log status to ANSWERED after launching dialer
        if (callLogId != null) {
          await Future.delayed(const Duration(seconds: 2));
          await _updateCallLogStatus(callLogId, 'ANSWERED');
        }
        
        _showToast('Calling $phoneNumber...');
      } else {
        _showToast('Unable to make call. Phone app not available.');
        
        if (callLogId != null) {
          await _updateCallLogStatus(callLogId, 'FAILED');
        }
      }
    } catch (e) {
      print('Error making call: $e');
      _showToast('Failed to initiate call');
      
      if (callLogId != null) {
        await _updateCallLogStatus(callLogId, 'FAILED');
      }
    }
  }
  
  Future<bool> _hasPhonePermission() async {
    return await Permission.phone.status == PermissionStatus.granted;
  }
  
  Future<void> _requestPhonePermission() async {
    final status = await Permission.phone.request();
    
    if (status != PermissionStatus.granted) {
      _showToast('Phone permission is required to make calls');
      throw Exception('Phone permission denied');
    }
  }
  
  Future<void> _updateCallLogStatus(String callLogId, String status) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return;
      
      final response = await http.put(
        Uri.parse('$_baseUrl/call-logs/$callLogId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'callStatus': status,
          'startTime': status == 'ANSWERED' ? DateTime.now().toIso8601String() : null,
        }),
      );
      
      if (response.statusCode == 200) {
        print('Call log status updated to $status');
      }
    } catch (e) {
      print('Error updating call log status: $e');
    }
  }
  
  Future<void> endCall(String callLogId, int durationSeconds, {String? notes, String? outcome}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return;
      
      final response = await http.put(
        Uri.parse('$_baseUrl/call-logs/$callLogId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'callStatus': 'COMPLETED',
          'endTime': DateTime.now().toIso8601String(),
          'duration': durationSeconds,
          'isAnswered': true,
          if (notes != null) 'notes': notes,
          if (outcome != null) 'outcome': outcome,
        }),
      );
      
      if (response.statusCode == 200) {
        print('Call completed and logged');
        _showToast('Call completed');
      }
    } catch (e) {
      print('Error ending call: $e');
    }
  }
  
  Future<bool> canMakeCall() async {
    try {
      return await canLaunchUrl(Uri(scheme: 'tel', path: '123'));
    } catch (e) {
      return false;
    }
  }
  
  Future<void> openDialer([String? phoneNumber]) async {
    try {
      if (!await _hasPhonePermission()) {
        await _requestPhonePermission();
      }
      
      final Uri dialerUri = phoneNumber != null
          ? Uri(scheme: 'tel', path: phoneNumber)
          : Uri(scheme: 'tel');
      
      if (await canLaunchUrl(dialerUri)) {
        await launchUrl(dialerUri);
      } else {
        _showToast('Unable to open dialer');
      }
    } catch (e) {
      print('Error opening dialer: $e');
      _showToast('Failed to open dialer');
    }
  }
  
  Future<void> makeDirectCall(String phoneNumber, int leadId, {String? notes}) async {
    try {
      // Create call log first
      final callLog = await _createCallLog(leadId, phoneNumber, notes);
      
      if (callLog != null) {
        // Make the call with the call log ID
        await makeCall(phoneNumber, callLog['id'].toString());
      } else {
        // Fallback to direct call without logging
        await makeCall(phoneNumber);
      }
    } catch (e) {
      print('Error making direct call: $e');
      _showToast('Failed to initiate call');
    }
  }
  
  Future<Map<String, dynamic>?> _createCallLog(int leadId, String phoneNumber, String? notes) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return null;
      
      final response = await http.post(
        Uri.parse('$_baseUrl/call-logs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'leadId': leadId,
          'phoneNumber': phoneNumber,
          'callType': 'OUTBOUND',
          if (notes != null) 'notes': notes,
        }),
      );
      
      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return data['data']['callLog'];
      }
      
      return null;
    } catch (e) {
      print('Error creating call log: $e');
      return null;
    }
  }
  
  Future<List<Map<String, dynamic>>> getRecentCalls() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return [];
      
      final response = await http.get(
        Uri.parse('$_baseUrl/call-logs/user'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data']['callLogs'] ?? []);
      }
      
      return [];
    } catch (e) {
      print('Error fetching recent calls: $e');
      return [];
    }
  }
  
  Future<Map<String, dynamic>> getCallAnalytics() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token == null) return {};
      
      final response = await http.get(
        Uri.parse('$_baseUrl/call-logs/analytics'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['analytics'] ?? {};
      }
      
      return {};
    } catch (e) {
      print('Error fetching call analytics: $e');
      return {};
    }
  }
  
  void _showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: const Color(0xFF333333),
      textColor: const Color(0xFFFFFFFF),
    );
  }
  
  // Utility method to format phone numbers
  String formatPhoneNumber(String phoneNumber) {
    // Remove all non-digit characters
    String digitsOnly = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    
    // Add country code if not present
    if (!digitsOnly.startsWith('+')) {
      if (digitsOnly.length == 10) {
        digitsOnly = '+1$digitsOnly'; // Assuming US/Canada
      } else if (digitsOnly.length == 11 && digitsOnly.startsWith('1')) {
        digitsOnly = '+$digitsOnly';
      }
    }
    
    return digitsOnly;
  }
  
  // Check if a phone number is valid
  bool isValidPhoneNumber(String phoneNumber) {
    String digitsOnly = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    return digitsOnly.length >= 10;
  }
}
