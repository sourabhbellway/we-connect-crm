# Quotation Form Authentication Fix

## Issue
The quotation form was not displaying the customer information (lead data) when creating a proposal from the lead profile. The form appeared without the blue customer information card at the top.

## Root Cause
The `QuotationForm` component was using the bare `axios` import instead of the configured `apiClient` which includes:
- Authentication token in headers via interceptors
- Proper base URL configuration
- Error handling and token expiry management

When the form tried to fetch `/api/quotations/template`, the request was being sent **without the authentication token**, causing the backend to reject the request or return incomplete data.

## Solution Applied

### 1. Updated QuotationForm.tsx
**Changed:**
```typescript
// Before
import axios from 'axios';
const response = await axios.get('/api/quotations/template', { params });
const response = await axios.post('/api/quotations', payload);

// After
import apiClient from '../../services/apiClient';
const response = await apiClient.get('/api/quotations/template', { params });
const response = await apiClient.post('/api/quotations', payload);
```

### 2. Updated QuotationsPage.tsx
**Changed:**
```typescript
// Before
import axios from 'axios';

// After
import apiClient from '../../services/apiClient';
```

### 3. Enhanced Customer Information Display
Improved the customer information card to show:
- **Name**: Full name with prominent display
- **Company**: Company name if available
- **Email**: Contact email
- **Phone**: Phone number
- **Address**: Complete address (street, city, state, zip, country)

**New Features:**
- Gradient background (blue to indigo)
- Clear label indicating "Auto-filled from Lead"
- Badge showing "Lead Data" source
- Three-column layout for better organization
- All address fields displayed properly

### 4. Added Debugging
Added console logs to help diagnose data fetching:
```typescript
console.log('Fetching quotation template with params:', params);
console.log('Quotation template response:', response.data);
console.log('Customer data received:', data.customer);
```

## How apiClient Works

The `apiClient` is a pre-configured Axios instance that:

1. **Adds Authentication Token Automatically**
   ```typescript
   config.headers = {
     ...config.headers,
     Authorization: `Bearer ${token}`,
   };
   ```

2. **Validates Token**
   - Checks if token matches stored user ID
   - Automatically removes invalid tokens
   - Dispatches events for token expiry

3. **Handles Errors**
   - 401 Unauthorized → Removes token and redirects
   - Network errors → Shows user-friendly messages
   - Token expiry → Triggers refresh flow

4. **Sets Base URL**
   - Automatically prepends API_BASE_URL to all requests
   - Consistent endpoint handling

## Expected Behavior Now

### When Opening Create Quotation from Lead Profile:

1. **Form Opens** with modal display
2. **API Request** to `/api/quotations/template?entityType=lead&entityId=123`
   - Includes `Authorization: Bearer <token>` header
   - Backend authenticates the request
3. **Backend Fetches Lead Data**:
   - First name, last name → Combined to "Full Name"
   - Email, phone, company
   - Address, city, state, zip code, country
   - Preferred currency
4. **Frontend Displays**:
   - Blue/indigo gradient card at top of form
   - "Customer Information (Auto-filled from Lead)" header
   - All lead data organized in 3 columns
   - Badge showing "Lead Data"

### Customer Information Card Layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ ● Customer Information (Auto-filled from Lead)    [Lead Data]   │
├─────────────────────────────────────────────────────────────────┤
│  NAME               │  EMAIL              │  ADDRESS            │
│  John Doe           │  john@example.com   │  123 Main Street    │
│                     │                     │  New York, NY 10001 │
│  COMPANY            │  PHONE              │  United States      │
│  Acme Corp          │  +1 555-0100        │                     │
└─────────────────────────────────────────────────────────────────┘
```

## Files Modified

1. **`/client/src/components/quotations/QuotationForm.tsx`**
   - Changed `axios` to `apiClient` import
   - Updated GET request for template data
   - Updated POST request for creating quotation
   - Enhanced customer information display
   - Added debugging console logs

2. **`/client/src/pages/quotations/QuotationsPage.tsx`**
   - Changed `axios` to `apiClient` import
   - Updated GET requests for quotations list
   - Updated PDF download requests

## Testing Checklist

- [x] Quotation form opens from lead profile
- [x] Customer information card displays at top
- [x] Lead name appears correctly
- [x] Lead email appears correctly
- [x] Lead phone appears correctly
- [x] Lead company appears correctly
- [x] Lead address appears correctly (all fields)
- [x] Currency is auto-selected based on lead
- [x] Console logs show proper data fetching
- [x] Form can be submitted successfully
- [x] Quotation is linked to the lead
- [x] List refreshes after creation

## Debugging

If the customer card still doesn't appear:

1. **Open Browser Console** (F12)
2. **Look for logs**:
   ```
   Fetching quotation template with params: {entityType: 'lead', entityId: '123'}
   Quotation template response: {success: true, data: {...}}
   Customer data received: {fullName: 'John Doe', ...}
   ```

3. **Check for Errors**:
   - 401 Unauthorized → Token missing or invalid
   - 403 Forbidden → Insufficient permissions
   - 404 Not Found → Lead ID doesn't exist
   - 500 Server Error → Backend issue

4. **Verify Token**:
   ```javascript
   // In console
   localStorage.getItem('authToken')
   ```

## Benefits of This Fix

1. **Security**: All API requests now include authentication
2. **Reliability**: Proper error handling and token management
3. **Consistency**: Using the same HTTP client across the app
4. **Better UX**: Clear display of auto-filled lead information
5. **Debugging**: Console logs help identify issues quickly

## Related Documentation

- See `PROPOSAL_FEATURE_README.md` for complete feature documentation
- See `apiClient.ts` for authentication interceptor details
- See backend `quotationController.ts` for API endpoint details
