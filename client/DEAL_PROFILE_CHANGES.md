# Deal Profile - Fully Dynamic Implementation

## ✅ What's Now Dynamic

### 1. **Main Deal Data**
- Fetches from: `GET /api/deals/:id`
- Includes: deal details, contact, lead, company, assigned user, initial tasks
- Auto-maps backend response to frontend interface

### 2. **Activities Tab** 
- **API**: `GET /api/activities?entityType=deal&entityId={id}`
- Shows all sales activities for the deal
- Loading state with spinner

### 3. **Tasks Tab**
- **API**: `GET /api/tasks?entityType=deal&entityId={id}`
- Fetches all action items for the deal
- Updates when tab is clicked
- Loading state with spinner

### 4. **Communications Tab**
- **API**: Parallel fetches from:
  - `GET /api/communications?entityType=deal&entityId={id}`
  - `GET /api/call-logs?entityType=deal&entityId={id}`
- Shows emails, calls, messages, and call logs
- Loading state with spinner

### 5. **Quotations Tab (Sales Proposals)**
- **API**: Parallel fetches from:
  - `GET /api/quotations?entityType=deal&entityId={id}`
  - `GET /api/invoices?entityType=deal&entityId={id}`
- Shows proposals and invoices
- Context-aware labels for deals
- Loading state with spinner

### 6. **Payments Tab (Payments & Revenue)**
- **API**: `GET /api/payments?entityType=deal&entityId={id}`
- Shows payment history and revenue tracking
- Loading state with spinner

### 7. **Notifications Tab**
- **API**: `GET /api/notifications?entityType=deal&entityId={id}`
- Shows deal-specific alerts and reminders

## 🔄 How It Works

1. **Initial Load**: Fetches deal details with basic info
2. **Tab Navigation**: When you click a tab, it fetches fresh data for that section
3. **Lazy Loading**: Data is only fetched when needed (tab-specific)
4. **Loading States**: Shows spinner while fetching data
5. **Error Handling**: Gracefully handles API failures

## 🎯 Key Features

### Lead Integration
- Shows "Converted from lead: [Name]" if deal came from a lead
- Clickable link to view the source lead profile
- Fetched from backend API automatically

### Sales-Focused Language
- "Opportunity Value" instead of "Deal Value"
- "Win Probability" instead of just "Probability"
- "Expected Revenue" = Deal Value × Probability
- "Sales Rep" instead of "Assigned To"
- "Primary Contact" for associated contact

### Dynamic Tab Labels
- **Overview** - Sales opportunity details
- **Pipeline Progress** - Visual pipeline tracking
- **Quotes & Proposals** - Sales proposals (not just "Quotations")
- **Sales Activities** - Sales-specific actions
- **Action Items** - Deal tasks
- **Communication** - Emails and calls
- **Payments & Revenue** - Revenue tracking
- **Alerts** - Notifications

## 📊 Data Flow

```
Component Mount
  ↓
Fetch Deal Details (GET /api/deals/:id)
  ↓
Display Overview Tab
  ↓
User Clicks Tab (e.g., "Activities")
  ↓
Fetch Tab Data (GET /api/activities?entityType=deal&entityId={id})
  ↓
Display Data in Tab
```

## 🔧 Technical Implementation

### State Management
```typescript
// Main deal data
const [deal, setDeal] = useState<Deal | null>(null);

// Dynamic data for each tab
const [activities, setActivities] = useState<any[]>([]);
const [tasks, setTasks] = useState<any[]>([]);
const [communications, setCommunications] = useState<any[]>([]);
const [quotations, setQuotations] = useState<any[]>([]);
const [payments, setPayments] = useState<any[]>([]);
// ... etc

// Loading states
const [activitiesLoading, setActivitiesLoading] = useState(false);
// ... etc for each tab
```

### Automatic Fetching
```typescript
useEffect(() => {
  if (!deal) return;
  
  switch (activeTab) {
    case 'activities': fetchActivities(); break;
    case 'tasks': fetchTasks(); break;
    case 'communications': fetchCommunications(); break;
    // ... etc
  }
}, [activeTab, deal]);
```

## 🚀 To See Changes

1. **Hard refresh browser**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. **Clear browser cache**: DevTools → Application → Clear Storage
3. **Restart dev server** if needed

## ✨ Differences from Contact Profile

| Feature | Contact Profile | Deal Profile |
|---------|----------------|--------------|
| **Purpose** | People/Companies (CRM) | Sales Opportunities |
| **Focus** | Relationship Management | Revenue Pipeline |
| **Key Metric** | Lead Score | Expected Revenue |
| **Quotations** | "Quotations" | "Sales Proposals" |
| **Progress** | Contact engagement | Pipeline stage & win probability |
| **Activities** | Generic activities | Sales activities |
| **Link to** | Deals, Leads | Source Lead, Contact |

The deal profile is now a fully dynamic, sales-focused opportunity tracker! 🎯
