# Quotation Module Implementation Guide

## Overview
The quotation module has been enhanced to be fully dynamic with product linking, customer detail fetching from leads/contacts/deals, currency management, and professional PDF generation with download/preview capabilities.

## Features Implemented

### 1. Enhanced Backend Controller
**File**: `server/src/controllers/quotationController.ts`

#### Enhanced Customer Detail Fetching
- **`getQuotationTemplate`** method now fetches comprehensive customer details from:
  - **Leads**: Full profile including address, company, position, website, currency, phone
  - **Contacts**: Complete contact info plus company relation details (if linked to a company)
  - **Deals**: Prioritizes contact over lead, includes deal value and currency
  
#### Dynamic Currency Management
- Fetches default currency from `BusinessSettings`
- Provides list of available currencies (USD, EUR, GBP, INR, AUD, CAD, JPY, CNY)
- Auto-suggests currency based on:
  1. Customer's currency preference
  2. Deal currency (if from deal)
  3. Company currency (if contact is linked to company)
  4. System default currency

#### Product Suggestions
- For deals: automatically suggests products from `DealProduct` records
- Pre-fills product details including name, quantity, and price

### 2. PDF Generation Service
**File**: `server/src/services/pdfService.ts`

#### Modern Professional PDF Design
- **Header Section**: Blue gradient banner with company name and quotation number
- **Company Details**: Email, phone, address, website in header
- **Customer Section**: "Bill To" section with complete customer information
- **Dates Display**: Issue date and valid until date
- **Line Items Table**: Professional table with:
  - Item name and description
  - Quantity and unit
  - Unit price
  - Tax rate percentage
  - Discount percentage
  - Line total
  - Alternating row colors for readability
- **Totals Section**: Subtotal, discount, tax, and grand total with blue highlight box
- **Notes & Terms**: Dedicated sections for additional information
- **Footer**: Generation timestamp and company name

#### Features
- Multi-currency support with proper symbols
- Automatic page breaks for long item lists
- Professional color scheme (blue primary, gray accents)
- Clean typography using Helvetica font family

### 3. PDF Endpoints
**File**: `server/src/routes/quotationRoutes.ts`

New routes added:
- `GET /api/quotations/:id/pdf/preview` - Opens PDF in browser tab
- `GET /api/quotations/:id/pdf/download` - Downloads PDF file

Both routes:
- Require authentication
- Fetch complete quotation with related data
- Generate PDF on-the-fly using PDFService
- Return proper headers for inline viewing or download

### 4. QuotationForm Component
**File**: `client/src/components/quotations/QuotationForm.tsx`

#### Dynamic Product Selection
- **Product Search**: Dropdown with searchable product list
- **Auto-fill**: Selecting a product auto-fills:
  - Name and description
  - Unit price and unit
  - Tax rate from product settings
- **Manual Entry**: Can also manually enter custom items

#### Customer Information Display
- Shows customer details at top of form when creating from lead/deal/contact
- Displays:
  - Full name and company
  - Email and phone
  - Highlighted in blue card for easy reference

#### Line Items Management
- Add multiple line items
- Each item has:
  - Name (with product search)
  - Description (optional)
  - Quantity and unit
  - Unit price
  - Tax rate (%)
  - Discount rate (%)
  - Calculated total
- Remove items (minimum 1 required)
- Real-time total calculation

#### Currency Selector
- Dropdown with all available currencies
- Shows currency code, symbol, and full name
- Auto-selected based on customer/deal context
- User can change as needed

#### Totals Summary
- Live calculation of:
  - Subtotal
  - Total discount amount
  - Total tax amount
  - Grand total
- Displayed in gradient blue card

#### Notes & Terms
- Text areas for:
  - Additional notes for customer
  - Terms and conditions
- Default terms auto-populated

### 5. Updated QuotationsPage
**File**: `client/src/pages/quotations/QuotationsPage.tsx`

#### New Features
- **Create Quotation Button**: Opens QuotationForm modal
- **Preview PDF**: Button with eye icon opens PDF in new tab
- **Download PDF**: Button with download icon saves PDF to device
- **Real API Integration**: Fetches quotations from backend
- **Auto-refresh**: Reloads list after creating new quotation

## Installation Requirements

### Backend Dependencies
You need to install PDFKit for PDF generation:

```bash
cd server
npm install pdfkit
npm install --save-dev @types/pdfkit
```

### Frontend Dependencies
No additional dependencies required (uses existing axios, lucide-react).

## Database Schema

The existing Prisma schema already supports all features:

### Quotation Model
```prisma
model Quotation {
  id              Int
  quotationNumber String
  title           String
  description     String?
  status          QuotationStatus
  subtotal        Decimal
  taxAmount       Decimal
  discountAmount  Decimal
  totalAmount     Decimal
  currency        String  @default("USD")
  validUntil      DateTime?
  notes           String?
  terms           String?
  leadId          Int?
  dealId          Int?
  contactId       Int?
  createdBy       Int
  items           QuotationItem[]
  lead            Lead?
  deal            Deal?
  contact         Contact?
  // ... other fields
}
```

### QuotationItem Model
```prisma
model QuotationItem {
  id            Int
  quotationId   Int
  productId     Int?
  name          String
  description   String?
  quantity      Decimal
  unit          String?
  unitPrice     Decimal
  taxRate       Decimal
  discountRate  Decimal
  subtotal      Decimal
  totalAmount   Decimal
  sortOrder     Int
  quotation     Quotation
  product       Product?
}
```

## API Endpoints

### Get Quotation Template
```
GET /api/quotations/template?entityType={lead|deal|contact}&entityId={id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "company": { /* BusinessSettings */ },
    "customer": { /* Customer details with fullName, email, phone, address, etc */ },
    "products": [ /* Array of available products */ ],
    "suggestedProducts": [ /* Products from deal if applicable */ ],
    "quotationNumber": "QT-2025-0001",
    "defaultCurrency": "USD",
    "suggestedCurrency": "USD",
    "availableCurrencies": [
      { "code": "USD", "symbol": "$", "name": "US Dollar" }
    ]
  }
}
```

### Create Quotation
```
POST /api/quotations
```

**Payload**:
```json
{
  "title": "Website Development Services",
  "description": "Custom website development",
  "currency": "USD",
  "validUntil": "2025-02-28",
  "notes": "Optional notes",
  "terms": "Payment terms",
  "leadId": 123, // or dealId or contactId
  "items": [
    {
      "productId": 1,
      "name": "Product Name",
      "description": "Optional description",
      "quantity": 2,
      "unit": "pcs",
      "unitPrice": 500,
      "taxRate": 10,
      "discountRate": 5
    }
  ]
}
```

### Preview PDF
```
GET /api/quotations/:id/pdf/preview
```
Opens PDF in browser (Content-Disposition: inline)

### Download PDF
```
GET /api/quotations/:id/pdf/download
```
Downloads PDF file (Content-Disposition: attachment)

## Usage Examples

### Creating Quotation from Lead
```typescript
<QuotationForm
  entityType="lead"
  entityId="123"
  onClose={() => setShowForm(false)}
  onSuccess={() => {
    fetchQuotations();
    setShowForm(false);
  }}
/>
```

### Creating Quotation from Deal
```typescript
<QuotationForm
  entityType="deal"
  entityId="456"
  onClose={() => setShowForm(false)}
  onSuccess={handleSuccess}
/>
```

### Creating Standalone Quotation
```typescript
<QuotationForm
  onClose={() => setShowForm(false)}
  onSuccess={handleSuccess}
/>
```

### Downloading PDF
```typescript
const handleDownloadPDF = async (quotationId: string) => {
  const response = await axios.get(
    `/api/quotations/${quotationId}/pdf/download`,
    { responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'quotation.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

## Key Benefits

1. **Fully Dynamic**: Products linked from inventory, no manual entry needed
2. **Smart Auto-fill**: Customer details automatically populated from leads/contacts/deals
3. **Multi-currency**: Support for 8 major currencies with auto-suggestion
4. **Professional PDFs**: Modern, branded PDF documents with clean design
5. **Real-time Calculations**: Automatic calculation of totals, taxes, and discounts
6. **Product Search**: Searchable product dropdown for easy selection
7. **Flexible**: Can create quotations standalone or link to leads/deals/contacts
8. **User-friendly**: Intuitive form with validation and error handling

## Future Enhancements

1. **Email Integration**: Send quotation PDFs directly via email
2. **Templates**: Save quotation templates for recurring services
3. **Version Control**: Track quotation revisions and changes
4. **Approval Workflow**: Multi-step approval process for high-value quotes
5. **E-signature**: Allow customers to sign quotations electronically
6. **Payment Links**: Include payment gateway links in quotations
7. **Analytics**: Track quotation conversion rates and performance
8. **Custom Branding**: Allow logo upload and custom color schemes for PDFs

## Testing Checklist

- [ ] Create quotation from lead with auto-filled customer details
- [ ] Create quotation from deal with suggested products
- [ ] Create quotation from contact with company details
- [ ] Create standalone quotation
- [ ] Select products from searchable dropdown
- [ ] Calculate totals with tax and discount
- [ ] Change currency and verify symbol updates
- [ ] Preview PDF in browser
- [ ] Download PDF to device
- [ ] Verify PDF includes all details correctly
- [ ] Test with multiple line items
- [ ] Test with different currencies
- [ ] Verify mobile responsiveness of form

## Support

For issues or questions, refer to:
- Backend controller: `server/src/controllers/quotationController.ts`
- PDF service: `server/src/services/pdfService.ts`
- Form component: `client/src/components/quotations/QuotationForm.tsx`
- Page component: `client/src/pages/quotations/QuotationsPage.tsx`
