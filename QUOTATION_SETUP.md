# Quotation Module - Quick Setup Guide

## Installation Steps

### 1. Install PDFKit Dependency

```bash
cd server
npm install pdfkit
npm install --save-dev @types/pdfkit
```

### 2. Rebuild the Server

```bash
# In server directory
npm run build
```

### 3. Restart the Server

```bash
npm run dev
# or
npm start
```

### 4. Verify Routes

The following routes should now be available:

- `GET /api/quotations/template` - Get quotation template data
- `POST /api/quotations` - Create new quotation
- `GET /api/quotations/:id` - Get quotation details
- `GET /api/quotations/:id/pdf/preview` - Preview PDF
- `GET /api/quotations/:id/pdf/download` - Download PDF
- `PUT /api/quotations/:id` - Update quotation
- `DELETE /api/quotations/:id` - Delete quotation
- `GET /api/quotations/stats` - Get statistics

## Quick Test

### 1. Create a Test Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Website Development",
    "description": "Full-stack website development",
    "price": 5000,
    "currency": "USD",
    "unit": "project",
    "taxRate": 10,
    "isActive": true
  }'
```

### 2. Test Quotation Template Endpoint

```bash
curl -X GET "http://localhost:3000/api/quotations/template?entityType=lead&entityId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "company": { /* company settings */ },
    "customer": { /* customer details */ },
    "products": [ /* product list */ ],
    "quotationNumber": "QT-2025-0001",
    "defaultCurrency": "USD",
    "suggestedCurrency": "USD",
    "availableCurrencies": [...]
  }
}
```

### 3. Create Test Quotation

```bash
curl -X POST http://localhost:3000/api/quotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Website Development Proposal",
    "description": "Custom website development for your business",
    "currency": "USD",
    "validUntil": "2025-03-01",
    "notes": "Thank you for your interest",
    "terms": "Payment within 30 days",
    "leadId": 1,
    "items": [
      {
        "name": "Website Development",
        "quantity": 1,
        "unit": "project",
        "unitPrice": 5000,
        "taxRate": 10,
        "discountRate": 0
      }
    ]
  }'
```

### 4. Test PDF Generation

Once you have a quotation ID (e.g., 1):

**Preview in Browser:**
```
http://localhost:3000/api/quotations/1/pdf/preview
```

**Download PDF:**
```
http://localhost:3000/api/quotations/1/pdf/download
```

## Using the UI

### 1. Navigate to Quotations Page

Go to: `http://localhost:5173/quotations` (or your frontend URL)

### 2. Click "Create Quotation" Button

This opens the quotation form modal.

### 3. Fill in Details

- **Title**: Enter quotation title
- **Currency**: Select from dropdown
- **Description**: Optional description
- **Valid Until**: Set expiration date
- **Line Items**: 
  - Click on item name field to see product search
  - Select product or enter custom item
  - Add quantities, prices, tax, discount
- **Notes**: Additional notes
- **Terms**: Terms and conditions

### 4. Click "Create Quotation"

The quotation will be created and the list will refresh.

### 5. Preview/Download PDF

- Click the **eye icon** to preview PDF in new tab
- Click the **download icon** to download PDF file

## Troubleshooting

### PDF Generation Fails

**Error**: "Cannot find module 'pdfkit'"

**Solution**: 
```bash
cd server
npm install pdfkit @types/pdfkit
npm run build
```

### Customer Details Not Showing

**Issue**: Customer info is null in template

**Solution**: Make sure you're passing correct `entityType` and `entityId`:
```javascript
// Correct
/api/quotations/template?entityType=lead&entityId=123

// Wrong
/api/quotations/template?type=lead&id=123
```

### Currency Not Auto-selecting

**Issue**: Currency always defaults to USD

**Solution**: 
1. Check if lead/contact/deal has currency field set
2. Verify BusinessSettings has default currency
3. Check browser console for API errors

### Products Not Loading

**Issue**: Product dropdown is empty

**Solution**:
1. Create products in the system first
2. Make sure products have `isActive: true`
3. Check that products are not soft-deleted (`deletedAt` should be null)

### PDF Shows "Your Company" Instead of Business Name

**Issue**: Company name not showing in PDF

**Solution**: 
1. Go to Business Settings
2. Set company name, address, phone, email
3. Regenerate the PDF

## Configuration

### Default Currency

Set in Business Settings:
```sql
UPDATE business_settings 
SET currency = 'EUR' 
WHERE id = 1;
```

### Default Terms

Modify in `QuotationForm.tsx`:
```typescript
setTerms(
  'Your custom default terms here.\nLine 2.\nLine 3.'
);
```

### Available Currencies

Add more currencies in `quotationController.ts`:
```typescript
const availableCurrencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  // Add more currencies here
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];
```

### PDF Color Scheme

Modify colors in `pdfService.ts`:
```typescript
// Header background
doc.rect(0, 0, pageWidth, 200).fill("#1a56db"); // Change hex color

// Table header
doc.rect(leftMargin, tableTop, contentWidth, 30).fill("#f3f4f6");

// Total box
doc.rect(totalsX, yPos - 5, 250, 35).fill("#1a56db");
```

## Environment Variables

No additional environment variables needed. Everything works with existing setup.

## Database Migrations

No database changes required. The existing Prisma schema supports all features.

## Next Steps

1. **Test the Module**: Create test quotations and verify PDFs
2. **Configure Business Settings**: Add company details for PDFs
3. **Add Products**: Create your product catalog
4. **Create Leads/Contacts**: Set up customer records
5. **Generate Quotations**: Start creating real quotations
6. **Train Users**: Show your team how to use the module

## Support

If you encounter issues:

1. Check server logs: `server/logs` or console output
2. Check browser console for frontend errors
3. Verify API responses in Network tab
4. Review implementation guide: `QUOTATION_MODULE_IMPLEMENTATION.md`

## Files Modified/Created

**Backend:**
- `server/src/controllers/quotationController.ts` (modified)
- `server/src/routes/quotationRoutes.ts` (modified)
- `server/src/services/pdfService.ts` (created)

**Frontend:**
- `client/src/components/quotations/QuotationForm.tsx` (created)
- `client/src/pages/quotations/QuotationsPage.tsx` (modified)

**Documentation:**
- `QUOTATION_MODULE_IMPLEMENTATION.md` (created)
- `QUOTATION_SETUP.md` (this file)

## Success Checklist

- [x] PDFKit installed
- [ ] Server rebuilt and restarted
- [ ] Business settings configured
- [ ] Test products created
- [ ] Test quotation created
- [ ] PDF preview works
- [ ] PDF download works
- [ ] Currency switching works
- [ ] Product search works
- [ ] Totals calculate correctly

Once all items are checked, the module is ready for production use!
