# Full-Page Quotation Creation Feature

## Overview
Replaced the modal/popup quotation form with a **full-page quotation creation experience** that includes:
- **Related dropdown** to choose between Lead or Contact
- **Search functionality** to find and select lead/contact by name
- **Auto-fill all customer data** when a lead/contact is selected
- **Professional full-page layout** with better UX

## Key Features

### 1. **Related Field with Dropdown**
- Select between **Lead** or **Contact**
- Changes the search context dynamically

### 2. **Search & Auto-Select**
- Type minimum 2 characters to search
- Real-time search with 300ms debounce
- Shows matching results in dropdown
- Displays name, email, and company for each result

### 3. **Auto-Fill Customer Data**
When you select a lead or contact, the form automatically fills:
- ✅ **Name**: Full name (First + Last)
- ✅ **Email**: Email address
- ✅ **Phone**: Phone number
- ✅ **Company**: Company name
- ✅ **Address**: Street address
- ✅ **City**: City name
- ✅ **State**: State/Province
- ✅ **Zip Code**: Postal code
- ✅ **Country**: Country
- ✅ **Currency**: Auto-selected based on lead/contact preference

### 4. **Beautiful UI Components**

#### Customer Selection Card
```
┌─────────────────────────────────────────────────────┐
│ Related: [Lead ▼]    Search: [John Doe________]    │
│                                                      │
│ ● Selected Customer Information    [Lead Data]      │
│ ┌────────────────────────────────────────────────┐  │
│ │ NAME           │ EMAIL          │ ADDRESS      │  │
│ │ John Doe       │ john@xyz.com   │ 123 Main St  │  │
│ │                │                │ NYC, NY 1001 │  │
│ │ COMPANY        │ PHONE          │ United States│  │
│ │ Acme Corp      │ +1 555-0100    │              │  │
│ └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## How to Use

### Option 1: From Lead Profile
1. Go to **Leads** → Select a lead → **Proposals** tab
2. Click **"New Proposal"**
3. System navigates to `/quotations/new?entityType=lead&entityId=123`
4. Lead data **auto-loads and fills** the form
5. Complete remaining fields and submit

### Option 2: From Quotations Page
1. Go to **Quotations** menu
2. Click **"Create Quotation"** button
3. Navigate to `/quotations/new`
4. Select **Related** type (Lead/Contact)
5. **Search** for the customer by name
6. **Select** from dropdown
7. Customer data **auto-fills**
8. Complete form and submit

### Option 3: Direct URL with Params
Navigate to:
- `/quotations/new?entityType=lead&entityId=42`
- `/quotations/new?entityType=contact&entityId=17`

The form will auto-load the specified entity's data.

## Form Sections

### 1. Customer Selection (Required)
- **Related dropdown**: Choose Lead or Contact
- **Search field**: Type name to search
- **Search results**: Click to select
- **Selected info card**: Shows all auto-filled data

### 2. Quotation Details
- **Title** (required): e.g., "Website Development Services"
- **Currency** (required): Auto-selected from customer
- **Description**: Optional details
- **Valid Until**: Expiration date

### 3. Line Items
- **Item Name** (required): Search products or enter manually
- **Description**: Optional
- **Quantity, Unit, Unit Price**
- **Tax Rate (%)**: Percentage
- **Discount (%)**: Percentage
- **Total**: Auto-calculated per item

### 4. Summary
- **Subtotal**: Sum of all items
- **Discount**: Total discount amount
- **Tax**: Total tax amount
- **Grand Total**: Final payable amount

### 5. Additional Information
- **Notes**: Customer-facing notes
- **Terms & Conditions**: Payment and validity terms

## API Endpoints Used

### Search Entities
- **GET** `/api/leads?search={query}&limit=10`
- **GET** `/api/contacts?search={query}&limit=10`

### Load Specific Entity
- **GET** `/api/leads/{id}`
- **GET** `/api/contacts/{id}`

### Get Form Template Data
- **GET** `/api/quotations/template`
  - Returns: products, currencies, default settings

### Create Quotation
- **POST** `/api/quotations`
  - Payload: `{ title, description, currency, items, leadId/contactId, ... }`

## Technical Implementation

### Files Created
1. **`/client/src/pages/quotations/CreateQuotationPage.tsx`**
   - New full-page component (850+ lines)
   - Complete form with search and auto-fill
   - Uses React hooks for state management
   - Debounced search with 300ms delay
   - URL parameter support for pre-loading

### Files Modified
1. **`/client/src/App.tsx`**
   - Added route: `/quotations/new`
   - Imported `CreateQuotationPage`

2. **`/client/src/pages/quotations/QuotationsPage.tsx`**
   - Changed "Create Quotation" to navigate to `/quotations/new`
   - Removed modal form logic

3. **`/client/src/components/shared/QuotationManager.tsx`**
   - Updated "New Proposal" to navigate with entity params
   - Removed modal form logic
   - Added `useNavigate` hook

## State Management

### Search State
```typescript
const [relatedType, setRelatedType] = useState<'lead' | 'contact'>('lead');
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<any[]>([]);
const [showSearchResults, setShowSearchResults] = useState(false);
const [selectedEntity, setSelectedEntity] = useState<CustomerData | null>(null);
const [searchLoading, setSearchLoading] = useState(false);
```

### Form State
```typescript
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [currency, setCurrency] = useState('USD');
const [validUntil, setValidUntil] = useState('');
const [items, setItems] = useState<QuotationItem[]>([...]);
```

## Auto-Fill Logic

```typescript
const populateCustomerData = (entity: any, type: 'lead' | 'contact') => {
  const customerData: CustomerData = {
    id: entity.id,
    fullName: `${entity.firstName} ${entity.lastName}`,
    email: entity.email,
    phone: entity.phone || entity.alternatePhone,
    company: entity.company,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zipCode: entity.zipCode,
    country: entity.country,
  };

  setSelectedEntity(customerData);
  
  // Auto-select currency if available
  if (entity.currency) {
    setCurrency(entity.currency);
  }
  
  toast.success(`${type === 'lead' ? 'Lead' : 'Contact'} data loaded successfully`);
};
```

## Search Functionality

```typescript
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    if (searchQuery.length >= 2) {
      searchEntities(searchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, 300);

  return () => clearTimeout(debounceTimer);
}, [searchQuery, relatedType]);
```

## Benefits

### For Users
✅ **Better UX**: Full page with more space and clarity
✅ **Faster**: Search and select in seconds
✅ **No Re-typing**: All data auto-fills from lead/contact
✅ **Flexible**: Works from lead profile or quotations page
✅ **Visual Feedback**: Green card shows selected customer clearly

### For Development
✅ **Cleaner Code**: Separated concerns (page vs modal)
✅ **Reusable**: Can be accessed from multiple places
✅ **Maintainable**: Single source of truth for quotation creation
✅ **Scalable**: Easy to add more features (templates, bulk actions)

## Example Workflow

### Creating Quotation from Lead Profile:
```
1. User on Lead Profile (John Doe)
2. Clicks "Proposals" tab → "New Proposal"
3. Navigates to: /quotations/new?entityType=lead&entityId=42
4. Form loads with:
   ✓ Related: Pre-set to "Lead"
   ✓ Search: Pre-filled "John Doe"
   ✓ Customer card shows all John's details
   ✓ Currency: Auto-selected (USD)
5. User adds:
   - Title: "Website Development"
   - Items: Product search, select, quantities
6. Clicks "Create Quotation"
7. Success! → Redirected to /quotations
```

### Creating Quotation Manually:
```
1. User clicks "Quotations" menu
2. Clicks "Create Quotation"
3. Navigates to: /quotations/new
4. Selects "Related": Contact
5. Types in search: "Jane"
6. Dropdown shows:
   - Jane Smith (jane@abc.com • ABC Corp)
   - Jane Doe (jane.doe@xyz.com • XYZ Inc)
7. Clicks "Jane Smith"
8. Customer card appears with all Jane's data
9. Completes form → Submit
10. Success! → Redirected to /quotations
```

## Validation

### Required Fields
- **Related**: Must select lead or contact
- **Search**: Must select an entity from search
- **Title**: Cannot be empty
- **Line Items**: At least one item with name

### Submit Button
- Disabled if no entity selected
- Shows "Creating..." during submission
- Minimum width for consistency

## Error Handling

- **Search fails**: Toast error "Failed to search"
- **Load entity fails**: Toast error "Failed to load lead/contact data"
- **Create fails**: Shows specific backend error message
- **Network error**: User-friendly error messages

## Future Enhancements

1. **Recent Selections**: Show recently selected leads/contacts
2. **Favorites**: Star frequently used contacts
3. **Bulk Items**: Import multiple items from CSV
4. **Templates**: Save quotation templates for reuse
5. **Duplicate**: Duplicate existing quotations
6. **Email Integration**: Send quotation directly after creation
7. **PDF Preview**: Preview before finalizing

## Summary

The quotation creation flow is now a **full-page experience** that:
- ✅ Eliminates the modal/popup
- ✅ Provides a **Related dropdown** (Lead/Contact)
- ✅ Includes **search functionality**
- ✅ **Auto-fills all customer data**
- ✅ Works seamlessly from lead profiles or quotations page
- ✅ Provides excellent UX with visual feedback

This matches the professional CRM experience you requested! 🎯
