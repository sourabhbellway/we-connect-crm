# TODO: Implement Service Interest & Commercial Expectation Sections

## Task
Add missing Service Interest and Commercial Expectation sections to LeadForm.tsx

## Fields to Implement

### Service Interest Fields
- primaryServiceCategory (EnhancedSelectField)
- wasteCategory (Conditional - shown only if primaryServiceCategory = "Waste Transportation")
- servicePreference (EnhancedMultiSelectField)
- serviceFrequency (EnhancedSelectField)
- expectedStartDate (InputField - date)
- urgencyLevel (EnhancedSelectField)

### Commercial Expectation Fields
- billingPreference (EnhancedSelectField)
- estimatedJobDuration (InputField - number)

## Form Order (Approved)
1. Lead (leadType, customerType) - via fieldConfigs
2. **Service Interest** - ✅ NEW SECTION
3. Personal (firstName, lastName, email, phone) - via fieldConfigs
4. **Commercial Expectation** - ✅ NEW SECTION
5. Company - via fieldConfigs
6. Location - via fieldConfigs
7. Lead Management - via fieldConfigs
8. Notes - via fieldConfigs
9. Products - hardcoded
10. Position - hardcoded

## Implementation Plan

### Step 1: Add Service Interest Section Component
✅ Created render handlers for all Service Interest fields

### Step 2: Add Commercial Expectation Section Component
✅ Created render handlers for all Commercial Expectation fields

### Step 3: Modify Form Rendering Logic
✅ Updated sectionConfig to include service_interest and commercial_expectation sections
✅ Updated preferredOrder to insert sections at correct positions
✅ Updated getSectionColorClass to include 'teal' color
✅ Updated isCustomField list to include new field names

### Step 4: Test the implementation
- Build the project
- Verify fields render correctly
- Verify conditional wasteCategory field works

## Status
- [x] Create Service Interest section renderer function
- [x] Create Commercial Expectation section renderer function
- [x] Modify form rendering logic to insert sections at correct positions
- [x] Add field configurations to seed script
- [x] Run seed script to add fields to database

## Final Form Order
1. Lead Type & Intent (leadType, customerType)
2. **Service Interest** (primaryServiceCategory, wasteCategory, servicePreference, serviceFrequency, expectedStartDate, urgencyLevel)
3. Personal Information (firstName, lastName, email, phone)
4. **Commercial Expectation** (billingPreference, estimatedJobDuration)
5. Company Information (company, position, industry, website, companySize, annualRevenue)
6. Location & Contact (country, state, city, zipCode, address, timezone, linkedinProfile)
7. Lead Management (sourceId, status, priority, assignedTo, budget, currency, leadScore, preferredContactMethod, nextFollowUpAt)
8. Notes & Tags (notes, tags)
9. Products (hardcoded)
10. Position (hardcoded)

## Next Steps
- Refresh the browser to see the new sections
- The fields will appear based on the fieldConfigs in the database
- Waste Category field is conditional - it only shows when Primary Service Category = "Waste Transportation"




