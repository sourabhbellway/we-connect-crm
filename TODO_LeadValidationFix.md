# TODO: Lead Validation Error Serialization Fix

## Issue
When lead submission validation fails, the backend returns "Validation failed" but the `errors` object with field-specific messages is not included in the response. This prevents users from seeing which specific fields have validation errors.

## Root Cause
In `leads.service.ts`, the `validateDynamicFields` method returns an error object like:
```typescript
{
  success: false,
  message: 'Validation failed',
  errors: { firstName: 'First Name is required', ... }
}
```

But when this is passed directly to `HttpException`, the nested `errors` object is not properly serialized in the response.

## Fix Plan

### Step 1: Fix HttpException in create() method ✅ COMPLETED
Updated the create method to explicitly structure the error response.

### Step 2: Fix HttpException in update() method ✅ COMPLETED
Same fix for the update method.

### Step 3: Verify error handling in LeadForm.tsx
The frontend already handles the `errors` object properly - it just wasn't receiving it.

## Changes Made

### File: `api/src/modules/leads/leads.service.ts`

**create() method:**
- Changed from throwing `HttpException(validationResult, ...)` to throwing a properly structured object that explicitly includes `success`, `message`, and `errors` properties.

**update() method:**
- Same fix applied.

## Status
- [x] Fix HttpException in leads.service.ts create() method
- [x] Fix HttpException in leads.service.ts update() method
- [ ] Restart API server to apply changes
- [ ] Test the fix

