# FCM Push Notification Integration - Setup Guide

## Overview
This guide explains how to complete the FCM (Firebase Cloud Messaging) integration for sending push notifications to your Flutter mobile app when calls are initiated from the web application.

## Changes Already Implemented

### 1. Database Schema (`api/prisma/schema.prisma`)
- ✅ Added `deviceToken String?` field to the User model

### 2. Backend API Changes

#### a. Login DTO (`api/src/modules/auth/dto/login.dto.ts`)
- ✅ Added optional `deviceToken` field to accept FCM token during login

#### b. Auth Service (`api/src/modules/auth/auth.service.ts`)
- ✅ Modified `login()` method to save deviceToken to user record when provided
- ✅ Added login activity logging

#### c. Notifications Service (`api/src/modules/notifications/notifications.service.ts`)
- ✅ Initialized Firebase Admin SDK
- ✅ Added `sendPushNotification()` method for sending FCM notifications

#### d. Call Logs Service (`api/src/modules/call-logs/call-logs.service.ts`)
- ✅ Integrated NotificationsService
- ✅ Added FCM notification trigger when call status is 'INITIATED'
- ✅ Sends notification with call details to the user's device

#### e. Module Configuration
- ✅ Updated `CallLogsModule` to import `NotificationsModule`

## ⚠️ REQUIRED MANUAL STEPS

### Step 1: Add Database Column
Since Prisma migration might have permission issues, manually add the column to your PostgreSQL database:

```sql
ALTER TABLE users ADD COLUMN "deviceToken" TEXT NULL;
```

You can run this via:
- pgAdmin
- psql command line: `psql -U your_username -d your_database`
- Or any PostgreSQL client

### Step 2: Regenerate Prisma Client
After adding the column, run:
```bash
cd api
npx prisma generate
```

### Step 3: Configure Firebase Admin SDK
Create a Firebase service account and add credentials to your `.env` file:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add to your `api/.env`:

```env
# Minify the JSON into a single line (remove newlines)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

### Step 4: Restart Backend Server
```bash
cd api
npm run start
```

## Flutter App Integration

### Update Login API Call
In your Flutter app, update the login API call to send the FCM device token:

```dart
// Get FCM token
final FirebaseMessaging messaging = FirebaseMessaging.instance;
final String? fcmToken = await messaging.getToken();

// Send to login API
final response = await http.post(
  Uri.parse('http://your-api-url/api/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': email,
    'password': password,
    'deviceToken': fcmToken,  // ← Add this
  }),
);
```

### Handle Incoming Notifications
Set up FCM listeners in your Flutter app:

```dart
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print('Received notification: ${message.notification?.title}');
  
  // Show local notification or in-app alert
  if (message.data['type'] == 'OUTGOING_CALL') {
    // Handle outgoing call notification
    final phoneNumber = message.data['phoneNumber'];
    final leadId = message.data['leadId'];
    
    // Show notification or navigate to call screen
  }
});
```

## Notification Flow

1. **Web App**: User clicks "Call Now" on `LeadProfile.tsx`
2. **Frontend**: `handleInitiateCall()` sends POST request to `/api/call-logs` with:
   - `callStatus: 'INITIATED'`
   - `userId`: Current logged-in user ID
   - `phoneNumber`, `leadId`, etc.

3. **Backend**: `CallLogsService.create()`:
   - Creates call log in database
   - Fetches user's `deviceToken`
   - Sends FCM notification via `NotificationsService.sendPushNotification()`

4. **Flutter App**: Receives notification with:
   - **Title**: "📞 Outgoing Call"
   - **Body**: "Calling [Lead Name] at [Phone Number]"
   - **Data**: `{ callId, leadId, phoneNumber, type: 'OUTGOING_CALL' }`

## Testing

### 1. Test Token Storage
Login from Flutter app and verify token is saved:
```sql
SELECT id, email, "deviceToken" FROM users WHERE email = 'your-email@example.com';
```

### 2. Test Notification Sending
Initiate a call from the web app and check:
- Backend logs: `✅ Push notification sent to user: X`
- Flutter app: Should receive notification

### 3. Debug Firebase Issues
Check backend logs for:
- `Firebase Admin SDK initialized successfully` ✅
- `Firebase not initialized` ❌ → Check FIREBASE_SERVICE_ACCOUNT env variable
- `Failed to send push notification` ❌ → Check FCM token validity

## Troubleshooting

### Issue: TypeScript Errors about `deviceToken`
**Solution**: Run `npx prisma generate` after adding the database column

### Issue: Firebase not initialized
**Solution**: 
1. Verify `FIREBASE_SERVICE_ACCOUNT` is in `.env`
2. Ensure JSON is valid (use online JSON validator)
3. Check backend startup logs

### Issue: Notifications not received in Flutter
**Solution**:
1. Verify FCM token in database matches Flutter device
2. Check Firebase Console → Cloud Messaging → Send test message
3. Ensure Flutter app has FCM permissions
4. Check if app is in foreground/background (handle both states)

### Issue: Token expires / changes
**Solution**: Implement token refresh in Flutter:
```dart
FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
  // Update token via PUT /api/auth/profile or similar endpoint
  updateDeviceToken(newToken);
});
```

## Security Notes

- Device tokens are stored as plain text (they're not sensitive like passwords)
- Tokens can be invalidated by user uninstalling app or revoking permissions
- Consider adding a `lastTokenUpdate` timestamp to track stale tokens
- Implement token cleanup for inactive users

## Future Enhancements

- [ ] Add endpoint to update device token: `PUT /api/users/device-token`
- [ ] Send notifications for incoming calls
- [ ] Add notification preferences per user
- [ ] Implement multi-device support (store multiple tokens per user)
- [ ] Add notification history/logs
- [ ] Support notification actions (Answer, Decline, etc.)
