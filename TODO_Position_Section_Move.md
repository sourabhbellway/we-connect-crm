# TODO: Move Position/Job Title from Company Information to SPOC Person Info Section

## Task
Move Position/Job Title field from Company Information section to SPOC Person Info (personal) section

## Current Issue
- Position field is configured with `section: 'personal'` in seedLeadFieldConfigs.js
- However, in LeadForm.tsx, the section order has 'company' before 'personal'
- This causes position to appear after company fields visually, making it appear in wrong section

## Changes Required

### Step 1: Update seedLeadFieldConfigs.js
- Move position field's displayOrder to fit within personal section properly
- Personal section fields order: firstName (10), lastName (11), email (12), phone (13), position (14), [other personal fields]

### Step 2: Update LeadForm.tsx
- Fix the preferred order in `getGroupedAndSortedFields()` function
- Move 'personal' section before 'company' section

## Files to Modify
1. `api/scripts/seedLeadFieldConfigs.js` - Update position displayOrder
2. `client/src/components/LeadForm.tsx` - Fix section order

## New Section Order
1. Lead
2. Service Interest
3. Personal (including position) ✅
4. Commercial Expectation
5. Company
6. Location
7. Lead Management
8. Notes

## Status
- [x] Step 1: Update seedLeadFieldConfigs.js - change position displayOrder from 31 to 14
- [x] Step 2: Update LeadForm.tsx - move 'personal' section before 'company' in preferred order
- [x] Step 3: Run seed script to update database - position field updated to section 'personal' with displayOrder 14
- [x] Step 4: Test the form rendering - The position field will now appear in SPOC Person Info section

## Summary of Changes Made

### 1. api/scripts/seedLeadFieldConfigs.js
- Moved position field to personal section with displayOrder 14 (after phone)
- Moved budget (Expected Budget) and currency to commercial_expectation section
- Reordered company fields to start from 31 (industry) instead of 32
- Removed duplicate entries for budget and currency from lead_management section

### 2. client/src/components/LeadForm.tsx
- Changed preferred section order from: `['lead', 'service_interest', 'company', 'personal', ...]`
- To: `['lead', 'service_interest', 'personal', 'commercial_expectation', 'company', ...]`

### 3. Database (field_config table)
- Updated position field: section = 'personal', displayOrder = 14
- Updated budget field: section = 'commercial_expectation', displayOrder = 22
- Updated currency field: section = 'commercial_expectation', displayOrder = 23

## New Section Order
1. Lead (leadType, customerType)
2. Service Interest
3. **Personal (firstName, lastName, email, phone, position)** ✅ Position is now here!
4. **Commercial Expectation (billingPreference, estimatedJobDuration, budget, currency)** ✅ Budget is now here!
5. Company (company, industry, website, companySize, annualRevenue)
6. Location
7. Lead Management
8. Notes

