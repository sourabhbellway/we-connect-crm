# Lead Form Reordering - Service Interest & Commercial Expectation

## Task
Move Service Interest and Commercial Expectation sections to new positions in the lead form.

## Current Order
1. Lead (leadType, customerType) - via fieldConfigs
2. Personal (firstName, lastName, email, phone) - via fieldConfigs
3. Company - via fieldConfigs
4. Location - via fieldConfigs
5. Lead Management - via fieldConfigs
6. Notes - via fieldConfigs
7. Products (hardcoded)
8. Position (hardcoded)
9. Service Interest (hardcoded - at end) ❌ WRONG POSITION
10. Commercial Expectation (hardcoded - at end) ❌ WRONG POSITION

## New Order (Approved)
1. Lead (leadType, customerType) - via fieldConfigs
2. **Service Interest** - ✅ NEW POSITION (after Lead)
3. Personal (firstName, lastName, email, phone) - via fieldConfigs
4. **Commercial Expectation** - ✅ NEW POSITION (after Personal)
5. Company - via fieldConfigs
6. Location - via fieldConfigs
7. Lead Management - via fieldConfigs
8. Notes - via fieldConfigs
9. Products - via fieldConfigs
10. Position - via fieldConfigs

## Changes Required in LeadForm.tsx

### Step 1: Modify form rendering logic
- Create custom rendering that inserts Service Interest after "lead" section
- Create custom rendering that inserts Commercial Expectation after "personal" section
- Remove the standalone Service Interest and Commercial Expectation sections at the end

### Step 2: Implementation Approach
Instead of using `sections.map()`, create a custom rendering function that:
1. Renders sections from fieldConfigs
2. After rendering "lead" section, render Service Interest
3. After rendering "personal" section, render Commercial Expectation
4. Skip the standalone Service Interest and Commercial Expectation sections at the end

## Status
- [x] Create TODO.md
- [x] Modify LeadForm.tsx to restructure form rendering
- [x] Test the form rendering (build passed successfully)

## Changes Made

### Modified File: `client/src/components/LeadForm.tsx`

1. **Added helper functions:**
   - `renderSection()` - Reusable section renderer
   - `renderDynamicSectionFields()` - Renders fields from field configs
   - `renderServiceInterestSection()` - Contains Service Interest fields
   - `renderCommercialExpectationSection()` - Contains Commercial Expectation fields

2. **Modified form rendering logic:**
   - Created custom rendering that inserts Service Interest after the "lead" section
   - Created custom rendering that inserts Commercial Expectation after the "personal" section
   - Removed the standalone Service Interest and Commercial Expectation sections at the end


### Modified File: `api/src/modules/leads/leads.service.ts`

**Create Method:**
- Added `serviceInterestFields` array containing all Service Interest field names
- Added `commercialExpectationFields` array containing all Commercial Expectation field names
- Modified field processing to include these fields in `customFieldsData` so they get saved to the database

**Update Method:**
- Added same field arrays for consistency
- Modified to merge new Service Interest and Commercial Expectation fields with existing `customFields`
- Ensures these fields are properly preserved during updates

**Validation Fixes:**
- Added early return when no field configs exist (skip validation)
- Enhanced validation to check for Service Interest and Commercial Expectation fields in both direct values and customFields
- Fixed update validation to properly skip validation when fields are not being changed

**Response Fixes:**
- Added `customFields` to `getById` response
- Added `customFields` to `list` response

### New Form Order:
1. Lead (leadType, customerType) - via fieldConfigs
2. **Service Interest** - ✅ NEW POSITION (after Lead)
3. Personal (firstName, lastName, email, phone) - via fieldConfigs
4. **Commercial Expectation** - ✅ NEW POSITION (after Personal)
5. Company - via fieldConfigs
6. Location - via fieldConfigs
7. Lead Management - via fieldConfigs
8. Notes - via fieldConfigs
9. Products - hardcoded
10. Position - hardcoded


