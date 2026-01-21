# TODO: Fix Lead Selection in CreateQuotationPage

## Issue
Lead selection dropdown is not displaying leads automatically when the dropdown is opened.

## Root Cause
1. When dropdown opens with empty search query, the useEffect closes the dropdown
2. Search only triggers when `searchQuery.length >= 2`
3. When empty, it shows "No leads found" instead of all leads

## Plan
1. Fix the useEffect logic to keep dropdown open when searchQuery is empty
2. Load all leads immediately when dropdown opens
3. Show all leads in dropdown when no search query
4. Filter leads only when user types

## Steps
- [x] Fix search useEffect to not close dropdown when searchQuery is empty
- [x] Load all leads on dropdown open
- [x] Show all leads when searchQuery is empty
- [x] Filter leads only when 2+ characters typed

## Changes Made

### File: client/src/pages/quotations/CreateQuotationPage.tsx

1. **Fixed search useEffect** (lines ~255-271):
   - Added `showSearchDropdown` to dependency array
   - Changed logic to keep dropdown open and show all leads when searchQuery is empty
   - Only filter when 2+ characters are typed

2. **Added lead loading on dropdown open** (lines ~656-664):
   - When dropdown is opened and leads are not loaded, call `fetchAllLeads()`

3. **Added useEffect to sync leads** (lines ~272-280):
   - When leads are loaded and dropdown is open, update searchResults to show all leads

