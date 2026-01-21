# Lead Submission Validation Debug Guide

This document explains how to debug lead submission validation errors in the WeConnect CRM system.

## Table of Contents
1. [Quick Debug Steps](#quick-debug-steps)
2. [Understanding the Validation Flow](#understanding-the-validation-flow)
3. [Using the Debug Endpoint](#using-the-debug-endpoint)
4. [Common Issues and Solutions](#common-issues-and-solutions)
5. [Server-Side Debugging](#server-side-debugging)
6. [Frontend Debugging](#frontend-debugging)
7. [Database Field Configurations](#database-field-configurations)

---

## Quick Debug Steps

### Step 1: Check Server Console Logs
When you submit a lead, the server will log detailed validation information:
```bash
cd api && npm run start:dev
```

Look for these log patterns:
- 🔍 `LEAD VALIDATION STARTED` - Validation began
- 🔎 `Validating field: fieldName = value` - Each field being checked
- ✅ `validation passed` - Field passed validation
- ❌ `ERROR: message` - Field failed validation
- 📊 `VALIDATION SUMMARY` - Final results

### Step 2: Test with Debug Endpoint
Use the new debug endpoint to test validation without saving:

```bash
# Test with curl
curl -X POST http://localhost:3010/api/leads/debug/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Test",
    "lastName": "Lead",
    "email": "test@example.com",
    "phone": "+971501234567"
  }'
```

### Step 3: Run the Debug Script
```bash
node TEST_LEAD_VALIDATION.js
```

---

## Understanding the Validation Flow

### Request Flow Diagram
```
Frontend Form
    ↓
Submit Lead Data
    ↓
API Controller (leads.controller.ts)
    ↓
CreateLeadDto Validation (class-validator)
    ↓
LeadsService.create()
    ↓
validateDynamicFields() ← Key validation point
    ↓
Check Field Configurations from Database
    ↓
Return Success or Error with Details
```

### Key Files Involved
- **Frontend**: `client/src/components/LeadForm.tsx`
- **Backend Controller**: `api/src/modules/leads/leads.controller.ts`
- **Backend Service**: `api/src/modules/leads/leads.service.ts`
- **DTO**: `api/src/modules/leads/dto/create-lead.dto.ts`
- **Database**: `FieldConfig` table

---

## Using the Debug Endpoint

### Endpoint: `POST /api/leads/debug/validate`

This endpoint tests validation without saving the lead. It returns:
- Which fields are being validated
- What values are being checked
- What validation rules apply
- Any errors found

### Example Response (Success)
```json
{
  "success": true,
  "message": "Validation passed",
  "errors": {},
  "validationDetails": [...],
  "fieldConfigCount": 15
}
```

### Example Response (Failure)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email must be a valid email address",
    "phone": "Phone must be a valid phone number"
  },
  "validationDetails": [...],
  "fieldConfigCount": 15
}
```

---

## Common Issues and Solutions

### Issue 1: No Field Configurations

**Symptoms**: Validation passes even with missing required fields

**Cause**: No field configurations exist in the database

**Solution**: Add field configurations or disable dynamic validation

```sql
-- Check if configs exist
SELECT * FROM "FieldConfig" WHERE "entityType" = 'lead';

-- If empty, validation is automatically skipped
```

### Issue 2: Required Field Without Value

**Symptoms**: Error message "X is required"

**Cause**: The field is marked as required in field config but empty in submission

**Solution**: 
1. Provide a value for the field
2. Or mark the field as not required in the database

```sql
-- Update field to not required
UPDATE "FieldConfig" 
SET "isRequired" = false 
WHERE "entityType" = 'lead' AND "fieldName" = 'fieldName';
```

### Issue 3: Invalid Email Format

**Symptoms**: "Email must be a valid email address"

**Cause**: Email doesn't match the regex pattern

**Valid formats**:
- `user@example.com` ✓
- `user.name@example.co.uk` ✓
- `user@subdomain.example.com` ✓

**Invalid formats**:
- `user@.com` ✗
- `user@example` ✗
- `user @example.com` ✗

### Issue 4: Invalid Phone Number

**Symptoms**: "Phone must be a valid phone number"

**Cause**: Phone doesn't meet digit requirements (7-15 digits)

**Solution**: 
- Remove special characters except +()-
- Ensure 7-15 digits total

### Issue 5: Number Field Out of Range

**Symptoms**: "Field must be at least X" or "Field must be at most X"

**Cause**: Number is outside the configured min/max bounds

**Solution**: Adjust the value or update the validation rules

---

## Server-Side Debugging

### Enable Verbose Logging

The validation now logs extensively to the console:

```bash
# Terminal output will show:
========================================
🔍 LEAD VALIDATION STARTED
========================================
📤 Data received: {...}
📋 Field configs found: 15

🔎 Validating field: email = "test@example.com" (required: true)
   🔧 Running email validation
   ✅ Email validation passed

🔎 Validating field: phone = "+971501234567" (required: true)
   🔧 Running phone validation
   ✅ Phone validation passed

📊 VALIDATION SUMMARY
========================================
Total fields checked: 15
Fields with errors: 0
Errors: {}
========================================
```

### Reading Error Responses

When validation fails, the server returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message"
  },
  "_debug": {
    "totalFieldsChecked": 15,
    "errorCount": 2,
    "errorFields": ["email", "phone"]
  }
}
```

---

## Frontend Debugging

### Browser Console Logging

The frontend now logs detailed error information:

```
========================================
🔍 LEAD SUBMISSION ERROR DEBUG
========================================
Full error object: {...}
Error response: {...}
Error data: {...}
Error status: 400
Error statusText: "Bad Request"
Error message: "Bad Request"
========================================
```

### How to Use Browser Console

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Submit a lead form
4. Look for the `🔍 LEAD SUBMISSION ERROR DEBUG` log
5. Expand the objects to see error details

### Expected Console Output on Error

```
🔍 LEAD SUBMISSION ERROR DEBUG
Full error object: Error: Request failed with status code 400
Error response: {data: {...}, status: 400, ...}
Error data: {success: false, message: "Validation failed", errors: {...}}
Error status: 400
Error statusText: "Bad Request"
Error message: "Request failed with status code 400"
```

---

## Database Field Configurations

### Table Structure

```sql
CREATE TABLE "FieldConfig" (
  id SERIAL PRIMARY KEY,
  "entityType" VARCHAR NOT NULL,  -- 'lead' for leads
  "fieldName" VARCHAR NOT NULL,   -- Field identifier
  label VARCHAR NOT NULL,         -- Display label
  "isRequired" BOOLEAN DEFAULT false,
  "isVisible" BOOLEAN DEFAULT true,
  "displayOrder" INTEGER DEFAULT 0,
  section VARCHAR,                -- Form section
  validation JSONB,               -- Validation rules
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Example Configurations

#### Required Email Field
```sql
INSERT INTO "FieldConfig" (
  "entityType", "fieldName", label, "isRequired", "isVisible", 
  "displayOrder", section, validation
) VALUES (
  'lead', 'email', 'Email Address', true, true, 1, 'personal',
  '{"type": "email"}'::jsonb
);
```

#### Required Phone Field
```sql
INSERT INTO "FieldConfig" (
  "entityType", "fieldName", label, "isRequired", "isVisible", 
  "displayOrder", section, validation
) VALUES (
  'lead', 'phone', 'Phone Number', true, true, 2, 'personal',
  '{"type": "phone"}'::jsonb
);
```

#### Number Field with Range
```sql
INSERT INTO "FieldConfig" (
  "entityType", "fieldName", label, "isRequired", "isVisible", 
  "displayOrder", section, validation
) VALUES (
  'lead', 'budget', 'Budget', false, true, 10, 'commercial',
  '{"type": "number", "min": 0, "max": 1000000}'::jsonb
);
```

### Viewing Current Configurations

```sql
-- List all lead field configurations
SELECT 
  "fieldName",
  label,
  "isRequired",
  "isVisible",
  "displayOrder",
  section,
  validation
FROM "FieldConfig"
WHERE "entityType" = 'lead'
ORDER BY "displayOrder";

-- Check for required fields
SELECT "fieldName", label 
FROM "FieldConfig" 
WHERE "entityType" = 'lead' AND "isRequired" = true;

-- Find validation rules
SELECT "fieldName", validation 
FROM "FieldConfig" 
WHERE "entityType" = 'lead' AND validation IS NOT NULL;
```

---

## Testing Checklist

Use this checklist when debugging:

- [ ] Server is running with `npm run start:dev`
- [ ] Database has field configurations
- [ ] Field configs are marked as visible (`isVisible = true`)
- [ ] Required fields have values in test data
- [ ] Email format matches pattern
- [ ] Phone has 7-15 digits
- [ ] Numbers are within min/max bounds
- [ ] Check server console for validation logs
- [ ] Check browser console for error details
- [ ] Use debug endpoint to isolate issues

---

## Getting Help

If you're still having issues:

1. **Run the debug script**: `node TEST_LEAD_VALIDATION.js`
2. **Check server logs**: Look for validation output in terminal
3. **Check browser console**: Look for error details in DevTools
4. **Verify database**: Ensure field configs exist and are correct
5. **Test with minimal data**: Try submitting with only required fields

---

## Related Files

| File | Purpose |
|------|---------|
| `api/src/modules/leads/leads-debug.service.ts` | Debug validation service |
| `api/src/modules/leads/leads.service.ts` | Main validation logic |
| `api/src/modules/leads/leads.controller.ts` | Debug endpoint |
| `client/src/components/LeadForm.tsx` | Frontend error handling |
| `TEST_LEAD_VALIDATION.js` | CLI test script |

