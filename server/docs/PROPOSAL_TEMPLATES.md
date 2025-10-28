# Proposal Templates

Modern, customizable proposal templates for the WeConnect CRM business settings.

## Overview

The proposal template system allows admin users to create, manage, and customize professional business proposal templates with modern designs. Templates support dynamic variables, custom styling, and can be used to generate proposals for leads and clients.

## Features

- **Modern Design Templates**: Pre-built templates with contemporary, professional designs
- **Variable System**: Dynamic placeholders for company and client information
- **Custom Styling**: Configurable colors, fonts, and layout options
- **Template Management**: Full CRUD operations for templates
- **Default Template**: Set one template as the default for new proposals
- **Soft Delete**: Templates can be archived without permanent deletion
- **Duplication**: Clone existing templates for quick customization

## Database Schema

```prisma
model ProposalTemplate {
  id               Int      @id @default(autoincrement())
  name             String
  description      String?
  content          String   @db.Text
  isActive         Boolean  @default(true)
  isDefault        Boolean  @default(false)
  headerHtml       String?  @db.Text
  footerHtml       String?  @db.Text
  styles           Json?
  variables        Json?
  previewImage     String?
  category         String?  @default("business")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  deletedAt        DateTime?
}
```

## API Endpoints

### Get All Templates
```http
GET /api/proposal-templates
Query Parameters:
  - category: string (optional) - Filter by category
  - isActive: boolean (optional) - Filter by active status
```

### Get Single Template
```http
GET /api/proposal-templates/:id
```

### Create Template
```http
POST /api/proposal-templates
Body: {
  name: string (required)
  description: string (optional)
  content: string (required) - Main HTML content
  headerHtml: string (optional) - Header HTML
  footerHtml: string (optional) - Footer HTML
  styles: object (optional) - Color and style configuration
  variables: object (optional) - Available variables
  category: string (optional) - Template category
  isActive: boolean (optional) - Active status
  isDefault: boolean (optional) - Set as default
}
```

### Update Template
```http
PUT /api/proposal-templates/:id
Body: Same as create (all fields optional)
```

### Delete Template
```http
DELETE /api/proposal-templates/:id
```

### Set Default Template
```http
PATCH /api/proposal-templates/:id/set-default
```

### Duplicate Template
```http
POST /api/proposal-templates/:id/duplicate
```

### Get from Business Settings
```http
GET /api/business-settings/proposal-templates
```

## Available Variables

Templates support the following dynamic variables:

### Company Variables
- `{{COMPANY_NAME}}` - Company name
- `{{COMPANY_EMAIL}}` - Company email
- `{{COMPANY_PHONE}}` - Company phone number
- `{{COMPANY_ADDRESS}}` - Company address
- `{{COMPANY_WEBSITE}}` - Company website URL

### Client Variables
- `{{CLIENT_NAME}}` - Client contact name
- `{{CLIENT_COMPANY}}` - Client company name

### Proposal Variables
- `{{PROJECT_TITLE}}` - Proposal/project title
- `{{DATE}}` - Current date or proposal date
- `{{VALID_UNTIL}}` - Proposal expiration date
- `{{TOTAL_AMOUNT}}` - Total proposal amount
- `{{CURRENCY}}` - Currency symbol/code

## Pre-built Templates

### 1. Modern Business Proposal
A clean, professional template featuring:
- Gradient blue header with bold typography
- Timeline visualization for project phases
- Feature cards with icons
- Modern color scheme (blue accent)
- Professional footer with company details

**Style Configuration:**
```json
{
  "primaryColor": "#2563eb",
  "secondaryColor": "#1e40af",
  "accentColor": "#3b82f6",
  "textColor": "#1f2937",
  "lightGray": "#f9fafb",
  "borderColor": "#e5e7eb",
  "fontFamily": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}
```

### 2. Minimal Clean Proposal
A minimalist template featuring:
- Simple black and white design
- Focus on content hierarchy
- Clean typography
- Minimal decorations
- Professional simplicity

**Style Configuration:**
```json
{
  "primaryColor": "#000000",
  "textColor": "#333333",
  "lightGray": "#fafafa",
  "borderColor": "#e0e0e0",
  "fontFamily": "'Helvetica Neue', Helvetica, Arial, sans-serif"
}
```

## Setup & Migration

### 1. Run Database Migration
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 2. Seed Default Templates
```bash
# Run the seeder
npx ts-node src/seeders/proposalTemplateSeeder.ts

# Or using npm script (if configured)
npm run seed:proposals
```

## Usage Example

### Creating a Custom Template

```typescript
const response = await fetch('/api/proposal-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Tech Startup Proposal",
    description: "Modern template for tech startups",
    category: "technology",
    headerHtml: `
      <div style="background: #6366f1; padding: 40px; color: white;">
        <h1>{{PROJECT_TITLE}}</h1>
      </div>
    `,
    content: `
      <div style="padding: 40px;">
        <p>Dear {{CLIENT_NAME}},</p>
        <p>Thank you for considering {{COMPANY_NAME}}...</p>
      </div>
    `,
    footerHtml: `
      <div style="background: #1f2937; padding: 20px; color: white;">
        <p>{{COMPANY_NAME}} | {{COMPANY_EMAIL}}</p>
      </div>
    `,
    styles: {
      primaryColor: "#6366f1",
      textColor: "#1f2937"
    },
    variables: {
      companyName: "{{COMPANY_NAME}}",
      clientName: "{{CLIENT_NAME}}",
      projectTitle: "{{PROJECT_TITLE}}"
    },
    isActive: true,
    isDefault: false
  })
});
```

### Rendering a Template

When generating a proposal, replace variables with actual data:

```typescript
function renderTemplate(template, data) {
  let html = template.headerHtml + template.content + template.footerHtml;
  
  // Replace all variables
  Object.keys(data).forEach(key => {
    const variable = `{{${key.toUpperCase()}}}`;
    const regex = new RegExp(variable, 'g');
    html = html.replace(regex, data[key]);
  });
  
  return html;
}

const proposalHtml = renderTemplate(template, {
  companyName: "WeConnect CRM",
  companyEmail: "hello@weconnect.com",
  companyPhone: "+1-555-0123",
  clientName: "John Doe",
  clientCompany: "Acme Corp",
  projectTitle: "Website Redesign",
  date: "December 15, 2024",
  validUntil: "January 15, 2025",
  totalAmount: "50,000",
  currency: "$"
});
```

## Permissions

Template management requires appropriate permissions:
- `proposal.read` - View templates
- `proposal.create` - Create new templates
- `proposal.update` - Edit templates
- `proposal.delete` - Delete templates

Admins should have all permissions by default.

## Best Practices

1. **Use Semantic HTML**: Structure content with proper HTML tags
2. **Inline Styles**: Always use inline CSS for email/PDF compatibility
3. **Test Variables**: Ensure all variables are replaced correctly
4. **Mobile-Friendly**: Consider responsive design patterns
5. **Brand Consistency**: Maintain consistent styling across templates
6. **Backup Templates**: Keep copies of customized templates
7. **Version Control**: Consider template versioning for major changes

## Future Enhancements

- [ ] Template preview in browser
- [ ] PDF export functionality
- [ ] Email delivery integration
- [ ] Rich text editor for content
- [ ] Template marketplace
- [ ] Version history
- [ ] Template analytics (usage tracking)
- [ ] Multi-language support
- [ ] Client-side template builder UI
