# Proposal/Quotation Feature in Lead Profile

## Overview
We have successfully integrated a Proposals tab in the Lead Profile view that allows users to create and manage quotations/proposals directly from a lead's profile page. The system automatically pre-fills lead information when creating a new proposal.

## Features Implemented

### 1. Proposals Tab in Lead Profile
- **Location**: Lead Profile → Proposals Tab
- **Purpose**: View and manage all quotations/proposals related to a specific lead
- **Features**:
  - View all quotations with status, amounts, and dates
  - Create new quotations with pre-filled lead data
  - Download quotations as PDF
  - Preview quotations
  - Track quotation status (Draft, Sent, Viewed, Accepted, Rejected, Expired, Cancelled)

### 2. Auto-Fill Lead Data in Quotation Form
When creating a new quotation from the lead profile, the following data is automatically pulled:

#### Customer Information Auto-Filled:
- **Name**: `{firstName} {lastName}`
- **Email**: Lead's email address
- **Phone**: Lead's phone number
- **Company**: Lead's company name
- **Address**: Lead's full address
- **City**: Lead's city
- **State**: Lead's state
- **Zip Code**: Lead's zip code
- **Country**: Lead's country
- **Currency**: Lead's preferred currency (or system default)

#### Additional Auto-Populated Fields:
- **Suggested Currency**: Based on lead's currency or company default
- **Terms & Conditions**: Default payment terms
- **Available Products**: Products from your catalog

### 3. Quotation Form Features

The quotation form includes:

#### Basic Information:
- **Title** (required): e.g., "Website Development Services"
- **Description**: Brief description of the quotation
- **Currency**: Auto-selected based on lead's currency
- **Valid Until**: Expiration date for the quotation

#### Line Items:
- **Item Name** (with product search)
- **Description**: Optional details
- **Quantity**: Number of units
- **Unit**: e.g., pcs, hours, days
- **Unit Price**: Price per unit
- **Tax Rate**: Percentage
- **Discount**: Percentage discount
- **Automatic Total Calculation**

#### Summary Section:
- **Subtotal**: Sum of all line items
- **Discount Amount**: Total discounts applied
- **Tax Amount**: Total tax calculated
- **Grand Total**: Final amount

#### Additional Fields:
- **Notes**: Additional information for the customer
- **Terms & Conditions**: Payment and validity terms

## How It Works

### Creating a Quotation from Lead Profile:

1. **Navigate to Lead Profile**
   - Go to Leads → Select a Lead → Proposals Tab

2. **Click "New Proposal"**
   - The system opens a quotation form modal
   - Lead's information is automatically fetched from the backend
   - Customer information section displays the lead's details

3. **Add Line Items**
   - Search for products from your catalog
   - Or manually enter item details
   - System calculates totals automatically

4. **Configure Details**
   - Set validity date
   - Add custom notes
   - Modify terms and conditions

5. **Create Quotation**
   - Click "Create Quotation"
   - System generates a unique quotation number (QT-YYYY-XXXX)
   - Quotation is saved and linked to the lead
   - List automatically refreshes to show the new quotation

## Technical Implementation

### Frontend Changes:

1. **LeadProfile.tsx**
   - Added "Proposals" tab
   - Added state for quotations and loading
   - Implemented `fetchQuotations()` function
   - Integrated QuotationManager component
   - Added refresh callback for real-time updates

2. **QuotationManager.tsx**
   - Added QuotationForm integration
   - Added modal state management
   - Connected "Create" buttons to open form
   - Added onRefresh callback support
   - Contextual labels (Proposals for deals, Quotations for leads/contacts)

3. **QuotationForm.tsx** (Already existed)
   - Automatically fetches template data via `/api/quotations/template`
   - Pre-fills customer information from lead data
   - Supports lead, deal, and contact entity types
   - Product search and selection
   - Real-time total calculations

### Backend Support:

The backend `/api/quotations/template` endpoint:
- Accepts `entityType` (lead, deal, contact) and `entityId` parameters
- Fetches lead data including:
  - Personal information (name, email, phone)
  - Company details
  - Address information
  - Preferred currency
- Returns customer data in a structured format
- Provides available products and currencies
- Suggests appropriate currency based on lead's settings

### API Endpoints Used:

1. **GET** `/api/quotations?entityType=lead&entityId={leadId}`
   - Fetches all quotations for a specific lead

2. **GET** `/api/quotations/template?entityType=lead&entityId={leadId}`
   - Fetches template data with pre-filled lead information

3. **POST** `/api/quotations`
   - Creates a new quotation
   - Payload includes: title, description, currency, items, leadId, etc.

4. **GET** `/api/quotations/{id}/pdf/preview`
   - Preview quotation as PDF

5. **GET** `/api/quotations/{id}/pdf/download`
   - Download quotation as PDF

## Benefits

### For Sales Team:
- **Faster Proposal Creation**: No need to manually re-enter lead information
- **Reduced Errors**: Auto-filled data ensures accuracy
- **Centralized View**: All proposals related to a lead in one place
- **Quick Access**: Create proposals directly from lead profile

### For Business:
- **Professional Quotations**: Consistent formatting and branding
- **Better Tracking**: Monitor proposal status and acceptance rates
- **Improved Follow-up**: Easy to see which leads have pending proposals
- **Data Integrity**: Automatic linking between leads and proposals

## Status Colors

- **Draft**: Gray - Not yet sent
- **Sent**: Blue - Sent to customer
- **Viewed**: Indigo - Customer has viewed
- **Accepted**: Green - Customer accepted
- **Rejected**: Red - Customer rejected
- **Expired**: Orange - Past validity date
- **Cancelled**: Gray - Manually cancelled

## Next Steps / Future Enhancements

1. **Email Integration**: Send quotations directly via email
2. **E-Signature**: Allow customers to sign quotations electronically
3. **Quotation Templates**: Pre-configured quotation templates for common services
4. **Automated Follow-ups**: Reminders for expiring quotations
5. **Quotation Analytics**: Track acceptance rates and average values
6. **Version Control**: Track quotation revisions and changes
7. **Convert to Deal**: Automatically create a deal when quotation is accepted

## Example Workflow

```
1. Lead comes in → Lead Profile created
2. Sales rep qualifies lead
3. Rep clicks "Proposals" tab → "New Proposal"
4. System auto-fills:
   - Customer: John Doe (john@example.com)
   - Company: Acme Corp
   - Address: 123 Main St, New York, NY 10001
   - Currency: USD
5. Rep adds services/products
6. Rep sets validity date
7. Rep creates quotation
8. System generates: QT-2025-0042
9. Rep can download PDF and send to customer
10. Track status changes (Sent → Viewed → Accepted)
```

## Files Modified

1. `/client/src/components/LeadProfile.tsx`
   - Added proposals tab and quotation management

2. `/client/src/components/shared/QuotationManager.tsx`
   - Integrated quotation form modal
   - Added refresh functionality

## Files Already Existing (Used)

1. `/client/src/components/quotations/QuotationForm.tsx`
   - Complete quotation creation form with auto-fill support

2. `/server/src/controllers/quotationController.ts`
   - Backend logic for quotation management and template generation

3. `/server/src/routes/quotationRoutes.ts`
   - API routes for quotation operations

## Summary

The Proposal/Quotation feature is now fully integrated into the Lead Profile view. When a user creates a quotation from a lead's profile, all the lead's information (name, email, phone, company, address, city, state, zip code, country, and currency) is automatically pulled and pre-filled in the quotation form. This provides a seamless experience similar to professional CRM systems like HubSpot, Salesforce, or Zoho CRM.
