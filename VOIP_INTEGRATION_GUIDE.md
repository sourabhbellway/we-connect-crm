# VoIP Integration Guide - India & Arabic Countries

## Overview
Comprehensive VoIP integration for WeConnect CRM supporting multiple providers for India and Arabic countries (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman).

## Supported Providers

### 1. **Twilio** (Global)
- Countries: India, Saudi Arabia, UAE, US, UK, Global
- Features: Call Recording, SMS, Voicemail, WebRTC
- Requirements: Account SID, Auth Token, From Number

### 2. **Exotel** (India-focused)
- Countries: India
- Features: Call Recording, SMS, IVR, Click to Call
- Requirements: API Key, API Secret, Virtual Number

### 3. **Unifonic** (Middle East)
- Countries: Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman
- Features: Voice, SMS, WhatsApp, Email
- Requirements: API Key (AppSid), Sender ID

### 4. **Plivo** (Global)
- Countries: India, Saudi Arabia, UAE, Global
- Features: Voice, SMS, Call Recording, SIP
- Requirements: Auth ID, Auth Token, From Number

### 5. **Knowlarity** (India & Asia)
- Countries: India, Saudi Arabia, UAE
- Features: IVR, Call Recording, Analytics, WhatsApp
- Requirements: API Key, API Secret, Virtual Number

## Installation & Setup

### 1. Database Migration

Run the VoIP migration SQL:

```bash
cd api/prisma
psql -U your_user -d your_database -f voip-migration.sql
```

Or using Prisma:
```bash
cd api
npx prisma db execute --file ./prisma/voip-migration.sql
```

This creates:
- `voip_configurations` table - Stores VoIP provider settings
- `voip_call_logs` table - Enhanced call logging with VoIP details

### 2. Backend Setup

The following files have been added:
- `api/src/modules/voip/voip.module.ts`
- `api/src/modules/voip/voip.service.ts`
- `api/src/modules/voip/voip.controller.ts`

VoipModule is already integrated in `app.module.ts`.

### 3. Frontend Setup

Files added:
- `client/src/pages/business-settings/VoipSettingsPage.tsx`
- `client/src/services/voipService.ts`

Route added to App.tsx: `/business-settings/voip`

### 4. Build & Start

```bash
# Backend
cd api
npm run build
npm run start

# Frontend
cd client
npm run dev
```

## Usage

### Accessing VoIP Settings

1. Navigate to **Business Settings** from the main menu
2. Click on **API & Integrations** category
3. Select **VoIP Settings**

### Adding a VoIP Configuration

1. Click **Add VoIP Configuration**
2. Select your **Provider** (Twilio, Exotel, Unifonic, etc.)
3. Choose the **Country** (India, Saudi Arabia, UAE, etc.)
4. Enter provider credentials:
   - **Twilio**: Account SID, Auth Token, From Number
   - **Exotel**: API Key, API Secret, Virtual Number
   - **Unifonic**: API Key (AppSid), Sender ID
   - **Plivo**: Auth ID, Auth Token, From Number
   - **Knowlarity**: API Key, API Secret, Virtual Number
5. Configure features:
   - ✅ Enable Click-to-Call
   - ✅ Enable Call Recording
   - ✅ Enable Voicemail
6. Set as **Default** (optional)
7. Click **Create**

### Testing Configuration

1. Click **Test** button on any configuration card
2. System validates connection to provider
3. Success/failure notification displayed

### Making Calls (API)

```typescript
import voipService from './services/voipService';

// Make a call
const result = await voipService.makeCall({
  toNumber: '+919876543210',
  fromNumber: '+911234567890',
  voipConfigId: 1,
  userId: 5,
  leadId: 123,
  dealId: 456
});
```

### Viewing Call Logs

```typescript
// Get all call logs
const logs = await voipService.getCallLogs();

// Filter by lead
const leadLogs = await voipService.getCallLogs({ leadId: 123 });

// Filter by user
const userLogs = await voipService.getCallLogs({ userId: 5 });
```

## API Endpoints

### Configurations
- `GET /voip/configurations` - List all configurations
- `GET /voip/configurations/:id` - Get single configuration
- `POST /voip/configurations` - Create configuration
- `PUT /voip/configurations/:id` - Update configuration
- `DELETE /voip/configurations/:id` - Delete configuration
- `POST /voip/configurations/:id/test` - Test connection

### Providers
- `GET /voip/providers` - List available providers

### Calls
- `POST /voip/call` - Initiate call
- `GET /voip/call-logs` - Get call logs

### Webhooks
- `POST /voip/webhook/:provider` - Receive provider webhooks

## Configuration Examples

### Twilio (India)
```json
{
  "provider": "twilio",
  "name": "India Production",
  "country": "IN",
  "accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "authToken": "your_auth_token",
  "fromNumber": "+911234567890",
  "webhookUrl": "https://your-domain.com/api/voip/webhook/twilio",
  "recordingEnabled": true,
  "voicemailEnabled": false,
  "clickToCallEnabled": true,
  "isActive": true,
  "isDefault": true
}
```

### Unifonic (Saudi Arabia)
```json
{
  "provider": "unifonic",
  "name": "Saudi Production",
  "country": "SA",
  "apiKey": "your_app_sid",
  "fromNumber": "YourSenderID",
  "webhookUrl": "https://your-domain.com/api/voip/webhook/unifonic",
  "recordingEnabled": true,
  "voicemailEnabled": false,
  "clickToCallEnabled": true,
  "isActive": true,
  "isDefault": false
}
```

### Exotel (India)
```json
{
  "provider": "exotel",
  "name": "India Exotel",
  "country": "IN",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "fromNumber": "08033551XXX",
  "recordingEnabled": true,
  "clickToCallEnabled": true,
  "isActive": true
}
```

## Features

### Click-to-Call
Enable users to make calls directly from lead/deal profiles with a single click.

### Call Recording
Automatically record all calls for compliance and quality assurance.

### Voicemail
Enable voicemail for missed calls (provider dependent).

### Call Logs
Comprehensive call history with:
- Duration tracking
- Recording URLs
- Lead/Deal association
- User assignment
- Call status tracking

### Multi-region Support
- India: Exotel, Knowlarity, Twilio, Plivo
- Saudi Arabia: Unifonic, Twilio, Plivo
- UAE: Unifonic, Twilio, Plivo
- Other GCC: Unifonic (Kuwait, Qatar, Bahrain, Oman)

## Security Considerations

1. **Credentials Storage**: All API keys and secrets are stored in the database
2. **Webhook Security**: Configure webhook URLs with authentication
3. **HTTPS Required**: All webhook endpoints must use HTTPS
4. **Access Control**: VoIP settings require appropriate permissions

## Troubleshooting

### Connection Test Fails
- Verify API credentials are correct
- Check provider account is active
- Ensure from number is configured in provider dashboard
- Verify network connectivity

### Calls Not Connecting
- Check VoIP configuration is active
- Verify from number has calling permissions
- Check provider account balance
- Review provider-specific restrictions

### Webhooks Not Received
- Ensure webhook URL is publicly accessible
- Verify HTTPS is configured
- Check firewall/security rules
- Review provider webhook logs

## Provider-Specific Notes

### Twilio
- Requires verified phone numbers in trial mode
- Supports global coverage
- Best documentation and support

### Exotel
- India-specific with local support
- Requires Indian business registration
- Excellent for Indian market

### Unifonic
- Middle East specialist
- Arabic language support
- WhatsApp Business integration available

### Plivo
- Cost-effective global option
- Good API documentation
- SIP support for advanced use cases

### Knowlarity
- Strong in India and Southeast Asia
- Advanced IVR capabilities
- Good for enterprise deployments

## Support

For issues or questions:
1. Check provider documentation
2. Review API logs in backend
3. Test configuration using Test button
4. Contact provider support for account-specific issues

## Future Enhancements

- [ ] SIP integration for desk phones
- [ ] Call queuing and distribution
- [ ] IVR flow builder
- [ ] Advanced call analytics
- [ ] Call disposition tracking
- [ ] Auto-dialer functionality
- [ ] Conference calling
- [ ] Call transfer capabilities