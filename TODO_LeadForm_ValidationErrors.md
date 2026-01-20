# TODO: Lead Form Validation Error Display

## Task
Display backend validation errors on the lead form so users can see which field has an error.

## Changes Made
- [x] Update handleSubmit in LeadForm.tsx to parse and display API validation errors
- [x] Add general error alert UI at the top of the form
- [x] Handle both error formats from backend:
  - Array format: `["email must be an email", "phone must be longer..."]`
  - Object format: `{"email": "Email is required", "phone": "Invalid phone"}`
- [x] Map field names from validation messages to form field names
- [x] Fix LeadCreate.tsx to re-throw errors so LeadForm can handle them
- [x] Fix LeadEdit.tsx to re-throw errors so LeadForm can handle them

## Implementation Details
- Parse `error.response?.data?.errors` from backend response
- Handle array format by parsing field names from messages
- Handle object format by directly mapping to form fields
- Display error count in a general error alert at the top of the form
- Each field-specific error displays under its respective input field
- Parent components (LeadCreate, LeadEdit) now re-throw errors after showing toast notifications

## Status
- [x] Completed

