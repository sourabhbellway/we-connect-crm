# WeConnect CRM Call Management Feature

This implementation adds comprehensive call logging and mobile dialer functionality to the WeConnect CRM system, including a Flutter mobile app that receives notifications and handles calls through the device's SIM card.

## 🚀 Features

### Backend Features
- **Call Logs Database**: Complete call history with status tracking
- **Call Management API**: RESTful endpoints for call operations
- **Notification System**: Server-side call initiation with mobile notifications
- **Call Analytics**: Comprehensive statistics and reporting

### Frontend (Web) Features
- **Call Logs Tab**: View and manage call history in lead profiles
- **Call Initiation**: One-click calling with mobile notification
- **Call History**: Track all communications with leads
- **Manual Call Logging**: Add call records manually

### Mobile App Features
- **Firebase Notifications**: Receive call requests instantly
- **Native Dialing**: Make calls through device SIM card
- **Call Analytics**: View call statistics and history
- **Automatic Logging**: Calls are automatically logged to CRM

## 📋 Prerequisites

### Backend Requirements
- Node.js 16+ with TypeScript
- PostgreSQL database
- Existing WeConnect CRM setup

### Mobile App Requirements
- Flutter SDK 3.0+
- Firebase project setup
- Android/iOS development environment

## 🛠 Installation & Setup

### 1. Backend Setup

#### Database Migration
```bash
# Navigate to server directory
cd server

# Generate Prisma client with new schema
npm run db:generate

# Run database migration
npm run db:migrate

# Seed database with call permissions
npm run db:seed
```

#### Install Dependencies
The required dependencies are already included in the existing setup.

#### Environment Variables
Add to your `.env` file:
```env
# Firebase Admin SDK (optional, for advanced notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

### 2. Frontend Setup

No additional setup required. The call logs feature is integrated into existing lead views.

### 3. Flutter Mobile App Setup

#### Install Flutter Dependencies
```bash
cd flutter_mobile_app
flutter pub get
```

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add Android/iOS apps to your project
3. Download configuration files:
   - `google-services.json` for Android (place in `android/app/`)
   - `GoogleService-Info.plist` for iOS (place in `ios/Runner/`)

4. Update `lib/firebase_options.dart` with your Firebase configuration:
```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'your-actual-api-key',
  appId: 'your-actual-app-id',
  messagingSenderId: 'your-actual-sender-id',
  projectId: 'your-actual-project-id',
  storageBucket: 'your-actual-storage-bucket',
);
```

#### Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.PHONE_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS Permissions
Add to `ios/Runner/Info.plist`:
```xml
<key>NSContactsUsageDescription</key>
<string>This app needs access to make phone calls</string>
```

## 🔧 Configuration

### API Endpoints

#### Call Logs
- `GET /api/call-logs/lead/:leadId` - Get call logs for a lead
- `GET /api/call-logs/user` - Get user's call logs
- `POST /api/call-logs` - Create a call log
- `PUT /api/call-logs/:id` - Update a call log
- `DELETE /api/call-logs/:id` - Delete a call log
- `POST /api/call-logs/initiate` - Initiate a call with mobile notification
- `GET /api/call-logs/analytics` - Get call analytics

### Database Schema

#### CallLog Table
```sql
call_logs:
  - id: Primary key
  - leadId: Foreign key to leads table
  - userId: Foreign key to users table
  - phoneNumber: The dialed number
  - callType: INBOUND | OUTBOUND
  - callStatus: INITIATED | RINGING | ANSWERED | COMPLETED | FAILED | BUSY | NO_ANSWER | CANCELLED
  - duration: Call duration in seconds
  - startTime: Call start timestamp
  - endTime: Call end timestamp
  - notes: Call notes
  - outcome: Call outcome/result
  - isAnswered: Boolean flag
  - recordingUrl: Optional call recording URL
  - metadata: Additional JSON metadata
  - createdAt: Creation timestamp
  - updatedAt: Update timestamp
```

## 📱 Mobile App Usage

### Initial Setup
1. Install and open the app
2. Login with CRM credentials
3. Grant phone and notification permissions

### Receiving Call Requests
1. Web user clicks "Call Now" in lead profile
2. Mobile app receives Firebase notification
3. User taps notification to open dialer
4. Call connects through device SIM

### Manual Dialing
1. Open app and go to "Dialer" tab
2. Enter phone number using keypad
3. Tap call button
4. Call connects and is automatically logged

### Viewing Analytics
- "Analytics" tab shows call statistics
- "Recent Calls" tab displays call history
- Pull to refresh for latest data

## 🔐 Security & Permissions

### Backend Permissions
- `lead.read` - View call logs
- `lead.update` - Create and update calls
- `lead.delete` - Delete call logs

### Mobile Permissions
- `CALL_PHONE` - Make phone calls
- `PHONE_STATE` - Monitor call state
- `INTERNET` - API communication
- Notification permissions for call alerts

## 🎯 Workflow

### Complete Call Flow
1. **Web Initiation**:
   - User opens lead profile
   - Clicks "Call Now" button
   - System creates call log with INITIATED status
   - Firebase notification sent to mobile

2. **Mobile Response**:
   - App receives notification
   - User taps to open dialer
   - Native phone dialer launches
   - Call log updated to RINGING

3. **Call Progress**:
   - When answered: Status → ANSWERED
   - During call: Timer tracks duration
   - Call end: Status → COMPLETED, duration saved

4. **Call Analytics**:
   - All calls tracked in database
   - Statistics updated in real-time
   - Reports available on mobile and web

## 📊 Analytics & Reporting

### Available Metrics
- Total calls made
- Answer rate percentage
- Average call duration
- Call status distribution
- Missed vs completed calls
- User-specific statistics

### Accessing Analytics
- **Web**: Lead profile → Call Logs tab
- **Mobile**: Analytics tab in home screen

## 🚨 Troubleshooting

### Common Issues

#### Notifications Not Received
- Verify Firebase configuration
- Check notification permissions
- Ensure FCM token is saved
- Test with Firebase Console

#### Calls Not Connecting
- Verify phone permissions
- Check phone number format
- Ensure SIM card is active
- Test with device's native dialer

#### API Errors
- Verify backend server is running
- Check authentication tokens
- Validate API endpoints
- Review server logs

### Debug Commands
```bash
# Check backend status
curl http://localhost:3001/api/health

# Test call log API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/call-logs/user

# Flutter debug logs
flutter logs
```

## 🔄 Future Enhancements

### Planned Features
- Call recording integration
- VoIP calling support
- Video calling capabilities
- Advanced analytics dashboard
- Call scheduling
- CRM integration with telephony systems

### Performance Optimizations
- Call log pagination
- Background sync
- Offline call queue
- Call quality metrics

## 📞 Support

For technical support or feature requests:
1. Check this documentation first
2. Review server and mobile logs
3. Test with demo credentials
4. Contact development team

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   Backend API    │    │  Flutter Mobile │
│                 │    │                  │    │      App        │
│ • Lead Profile  │◄──►│ • Call Log API   │◄──►│ • Notifications │
│ • Call Buttons  │    │ • Analytics      │    │ • Dialer        │
│ • Call History  │    │ • Notifications  │    │ • Call Logs     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │    Database      │
                    │                  │
                    │ • Users          │
                    │ • Leads          │
                    │ • Call Logs      │
                    └──────────────────┘
```

This implementation provides a complete call management solution integrated seamlessly with the existing WeConnect CRM system.