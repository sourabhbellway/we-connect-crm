# Proposal Templates - Quick Setup Guide

## What Was Created

A complete proposal template system for business settings with:

✅ **Database Schema**: `ProposalTemplate` model added to Prisma schema
✅ **Backend API**: Full CRUD endpoints for template management
✅ **Sample Templates**: Two modern, professional proposal templates
✅ **Documentation**: Complete API and usage documentation

## Files Created/Modified

### New Files
- `server/src/controllers/proposalTemplateController.ts` - Template management controller
- `server/src/routes/proposalTemplateRoutes.ts` - API routes
- `server/src/seeders/proposalTemplateSeeder.ts` - Default templates seeder
- `server/docs/PROPOSAL_TEMPLATES.md` - Full documentation

### Modified Files
- `server/prisma/schema.prisma` - Added ProposalTemplate model
- `server/src/server.ts` - Registered new routes
- `server/src/routes/businessSettingsRoutes.ts` - Added endpoint
- `server/src/controllers/businessSettingsController.ts` - Added method

## Setup Instructions

### 1. Generate Prisma Client and Run Migration
```bash
cd server
npm run db:generate
npm run db:migrate
```

When prompted for migration name, enter: `add_proposal_templates`

### 2. Seed Default Templates
```bash
npx ts-node src/seeders/proposalTemplateSeeder.ts
```

This will create two templates:
- **Modern Business Proposal** (default) - Blue gradient, timeline, modern design
- **Minimal Clean Proposal** - Black & white minimalist design

### 3. Restart Server
```bash
npm run dev
# or
npm run server
```

## API Endpoints Available

### Business Settings Integration
```
GET /api/business-settings/proposal-templates
```

### Template Management
```
GET    /api/proposal-templates              # List all templates
GET    /api/proposal-templates/:id          # Get single template
POST   /api/proposal-templates              # Create template
PUT    /api/proposal-templates/:id          # Update template
DELETE /api/proposal-templates/:id          # Delete template
PATCH  /api/proposal-templates/:id/set-default   # Set as default
POST   /api/proposal-templates/:id/duplicate     # Duplicate template
```

## Template Features

### Modern Business Proposal
- Gradient blue header with project title
- Professional introduction section
- Executive summary box
- Project overview with cards
- Visual timeline (4 phases)
- Large investment display
- "Why Choose Us" section with icons
- Call-to-action section
- Professional footer

### Minimal Clean Proposal
- Simple black border header
- Clean typography
- Focused on content
- Minimalist design
- Professional simplicity

## Dynamic Variables

Both templates support:
- `{{COMPANY_NAME}}`, `{{COMPANY_EMAIL}}`, `{{COMPANY_PHONE}}`
- `{{COMPANY_ADDRESS}}`, `{{COMPANY_WEBSITE}}`
- `{{CLIENT_NAME}}`, `{{CLIENT_COMPANY}}`
- `{{PROJECT_TITLE}}`, `{{DATE}}`, `{{VALID_UNTIL}}`
- `{{TOTAL_AMOUNT}}`, `{{CURRENCY}}`

## Testing

### Test API with curl
```bash
# Get all templates
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/proposal-templates

# Get from business settings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/business-settings/proposal-templates
```

### Frontend Integration
Templates can be fetched and displayed in:
- Business Settings > Proposal Templates section
- When creating new proposals for leads/deals
- Template selection dropdown in proposal forms

## Next Steps for Frontend

1. **Settings Page**: Add "Proposal Templates" tab in Business Settings
2. **Template List**: Display templates with preview cards
3. **Template Editor**: Rich text editor for template customization
4. **Preview**: Show live preview of template with sample data
5. **Proposal Generator**: Use templates when creating proposals

## Design Highlights

### Modern Business Proposal
- **Colors**: Blue gradient (#2563eb to #1e40af)
- **Font**: Inter, system fonts
- **Style**: Professional, contemporary, trustworthy
- **Best For**: Corporate, B2B, professional services

### Minimal Clean Proposal
- **Colors**: Black & white
- **Font**: Helvetica Neue, Arial
- **Style**: Minimalist, elegant, timeless
- **Best For**: Design agencies, consulting, creative services

## Permissions

Ensure admin users have these permissions:
- `proposal.read` - View templates
- `proposal.create` - Create templates
- `proposal.update` - Edit templates
- `proposal.delete` - Delete templates

## Troubleshooting

### Migration Issues
If migration fails, try:
```bash
npm run db:reset  # WARNING: Deletes all data
npm run db:migrate
```

### Seeder Already Ran
The seeder checks for existing templates and skips if found. To re-seed:
```bash
# Delete existing templates in database first, then run seeder
npx ts-node src/seeders/proposalTemplateSeeder.ts
```

### Import Errors
If you see "Cannot find module" errors:
```bash
npm run db:generate  # Regenerate Prisma client
npm install          # Reinstall dependencies
```

## Support

For detailed documentation, see: `server/docs/PROPOSAL_TEMPLATES.md`

---

**Status**: ✅ Ready to use after running setup steps above
**Version**: 1.0.0
**Date**: December 2024
