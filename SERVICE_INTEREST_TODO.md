# Service Interest Implementation - TODO

## Overview
Add "Service Interest" section to the lead form with the following fields:
- Primary Service Category (Required | Dropdown)
- Waste Category (Conditional | Dropdown) - Shown only if service = Waste Transportation
- Service Preference (Required | Multi-select)
- Service Frequency (Required | Dropdown)
- Expected Start Date (Optional | Date)
- Urgency Level (Required | Dropdown)

## Tasks

### Phase 1: Backend Updates
- [x] 1.1 Update create-lead.dto.ts - Add service interest fields and commercial expectation fields
- [x] 1.2 Update seedLeadFieldConfigs.js - Removed service interest from field configs (now hardcoded)

### Phase 2: Frontend Updates
- [x] 2.1 Update leadService.ts - Add service interest and commercial expectation fields to LeadPayload interface
- [x] 2.2 Update en.json - Add translation keys for all new fields including commercial expectation
- [x] 2.3 Update LeadForm.tsx - Add Service Interest and Commercial Expectation sections with conditional logic

### Phase 3: New Features Added
- [x] Position field moved after customerType (in Lead section) for Service Leads
- [x] Commercial Expectation section added with:
  - Billing Preference (Optional | Dropdown: Per Load, Per Hour, Lump Sum)
  - Estimated Job Duration (Hours) (Optional | Number)
- [x] Service Interest section with conditional Waste Category visibility
- [x] Fixed duplication issue by removing service interest from field configs

## Implementation Details

### Form Section Order:
1. Lead Type & Intent (lead, personal, company sections from field configs)
2. Products Section
3. Position Field (for Service Leads, after Lead Type)
4. Service Interest Section (Core Nidukki Requirement)
5. Commercial Expectation Section (new)
6. Notes & Tags

### Field Options:

**Primary Service Category:**
- Waste Transportation
- High Pressure Jetting
- Deep Cleaning
- Manpower Supply

**Waste Category (Conditional):**
- Solid Waste
- Liquid Waste

**Service Preference (Multi-select):**
- Tanker Service
- Skip Services
- Jetting Service
- Road Sweeper
- Combination Truck
- Rough Use
- Compactor
- Six Wheel
- Janitorial
- Deep Cleaning

**Service Frequency:**
- One-time
- Daily
- Alternate Days
- Weekly
- Monthly

**Urgency Level:**
- High
- Medium
- Low

**Billing Preference:**
- Per Load
- Per Hour
- Lump Sum

## Status: Completed
All features have been implemented successfully.
The duplication issue has been fixed by removing service interest fields from field configs and using hardcoded sections instead.

