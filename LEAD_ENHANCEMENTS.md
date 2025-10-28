# Lead Management Enhancements

This document describes the new lead management features including third-party integrations, bulk import/export, and automated lead syncing.

## 🚀 New Features Overview

### 1. Third-Party Integrations
- **Meta Ads (Facebook)**: Automatically import leads from Facebook Lead Ads campaigns
- **IndiaMart**: Sync leads from IndiaMart business inquiries  
- **TradeIndia**: Import buyer inquiries from TradeIndia platform
- **Automated Scheduling**: Configurable sync intervals for each integration
- **Real-time Status**: Monitor integration health and last sync times

### 2. Bulk Import/Export
- **CSV Import**: Upload leads in bulk using CSV files with validation
- **CSV Export**: Download leads data with filtering options
- **Template Download**: Get a properly formatted CSV template
- **Error Handling**: Detailed error reporting for failed imports
- **Progress Tracking**: Import batch tracking and history

### 3. Enhanced Lead Management
- **Integration Source Tracking**: See which platform each lead came from
- **Duplicate Prevention**: Automatic email-based duplicate detection
- **Sync History**: Complete audit trail of all integration activities
- **Manual Sync**: On-demand sync for specific integrations

## 🔧 Setup Instructions

### Database Migration
The new features require database schema updates that have been applied automatically.

### 1. Configure Third-Party Integrations

#### Meta Ads (Facebook) Setup:
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create or select your app
3. Add the "Marketing API" product
4. Generate an Access Token with `leads_retrieval` permission
5. In WeConnect CRM:
   - Navigate to Settings > Integrations
   - Enable Meta Ads integration
   - Enter your Access Token as API Key
   - (Optional) Add App Secret for enhanced security
   - Click "Test" to verify connection
   - Save settings

#### IndiaMart Setup:
1. Login to your IndiaMart account
2. Go to My IndiaMart > Manage BL
3. Click on "CRM Integration"
4. Copy your unique CRM Key
5. In WeConnect CRM:
   - Navigate to Settings > Integrations
   - Enable IndiaMart integration
   - Enter your CRM Key as API Key
   - Click "Test" to verify connection
   - Save settings

#### TradeIndia Setup:
1. Login to your TradeIndia account
2. Go to My Account > API Integration
3. Generate or copy your API Key and Secret
4. In WeConnect CRM:
   - Navigate to Settings > Integrations
   - Enable TradeIndia integration
   - Enter your API Key and Secret
   - Click "Test" to verify connection
   - Save settings

### 2. Automated Sync Scheduling

Once integrations are configured and enabled, automatic syncing will begin:

- **Meta Ads**: Every 15 minutes (Facebook leads are time-sensitive)
- **IndiaMart**: Every 30 minutes (B2B inquiries)
- **TradeIndia**: Every 2 hours (B2B inquiries, less frequent)

You can also trigger manual syncs from the Leads page using the "Sync Integrations" button.

## 📥 Bulk Import Instructions

### CSV Format Requirements

#### Required Columns:
- `firstName` - Lead's first name
- `lastName` - Lead's last name  
- `email` - Lead's email address (must be unique)

#### Optional Columns:
- `phone` - Phone number
- `company` - Company name
- `position` - Job title/position
- `status` - Lead status (NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED, LOST)
- `priority` - Priority level (LOW, MEDIUM, HIGH, URGENT)
- `budget` - Budget amount (numeric)
- `industry` - Industry category
- `website` - Company website
- `address` - Full address
- `city` - City name
- `state` - State/province
- `country` - Country name
- `zipCode` - Postal code
- `linkedinProfile` - LinkedIn profile URL
- `notes` - Additional notes

### Import Process:

1. **Download Template**: Click "Bulk Actions" > "Download Template" to get a properly formatted CSV
2. **Prepare Data**: Fill in your lead data following the template format
3. **Upload File**: Click "Bulk Actions" > "Import Leads"
4. **Select File**: Choose your CSV file (max 10MB)
5. **Review**: Check the import preview and instructions
6. **Import**: Click "Import Leads" to start the process
7. **Monitor**: View import results and any error details

### Import Validation:

- **Email Validation**: Proper email format required
- **Duplicate Detection**: Existing emails will be skipped
- **Field Validation**: Status and priority must match valid options
- **Size Limits**: Maximum 10MB file size
- **Batch Processing**: Large files are processed in batches of 50 records

## 📤 Bulk Export Options

### Export Filtered Data:
1. Apply any filters on the Leads page (status, search, etc.)
2. Click "Bulk Actions" > "Export Leads"
3. Download will include only filtered results
4. Export includes all lead data and metadata

### Export Fields:
- All lead information including ID, names, contact details
- Status, priority, and timestamps
- Assigned user information
- Source and tracking data
- Custom fields and notes

## 🔍 Monitoring & Troubleshooting

### Integration Status:
- **Green Circle**: Integration configured and working
- **Red X**: Integration not configured or failing
- **"Enabled" Badge**: Integration is active and syncing

### Error Handling:
- **API Errors**: Check API credentials and permissions
- **Network Issues**: Verify internet connectivity
- **Rate Limits**: Automatic retry with exponential backoff
- **Invalid Data**: Detailed error logs for troubleshooting

### Integration Logs:
View detailed logs in the admin panel:
- Last sync times for each integration
- Success/failure counts
- Error messages and debugging information
- Historical sync performance

## 📊 Performance Optimizations

### Database Indexing:
- Indexed email fields for fast duplicate detection
- Optimized queries for large lead datasets
- Efficient pagination for import/export operations

### API Rate Limiting:
- Respectful API usage within platform limits
- Automatic retry logic for temporary failures
- Batch processing to minimize API calls

### Memory Management:
- Streaming CSV processing for large files
- Chunked database operations
- Automatic cleanup of temporary files

## 🔒 Security Considerations

### API Key Protection:
- API secrets are encrypted in database storage
- Masked display in user interface
- Secure transmission using HTTPS only

### Data Privacy:
- GDPR compliant data handling
- Audit trails for all data operations
- Secure deletion of temporary import files

### Access Control:
- Permission-based access to integration features
- Role-based restrictions on bulk operations
- User activity logging for compliance

## 🚨 Important Notes

### Rate Limits:
- **Meta Ads**: 25 requests per hour per app
- **IndiaMart**: 1000 requests per day
- **TradeIndia**: 500 requests per hour

### Data Retention:
- Integration logs kept for 90 days
- Import batch history kept for 6 months
- Failed sync records retained for troubleshooting

### Best Practices:
1. **Test Integrations**: Always test connections before enabling
2. **Monitor Regularly**: Check integration status daily
3. **Backup Data**: Export leads regularly as backup
4. **Clean Data**: Maintain clean, deduplicated lead database
5. **Review Logs**: Check integration logs weekly for issues

## 📞 Support

If you encounter issues:

1. **Check Integration Status**: Verify all integrations show as "Configured"
2. **Test Connections**: Use the "Test" button for each integration
3. **Review Error Logs**: Check detailed error messages
4. **Verify API Keys**: Ensure credentials are correct and have proper permissions
5. **Contact Support**: Provide integration logs and error details

## 📈 Future Enhancements

Planned features for future releases:
- Additional integration platforms (Google Ads, LinkedIn, etc.)
- Advanced lead scoring and routing
- Custom field mapping for integrations
- Webhook support for real-time syncing
- Advanced analytics and reporting
- White-label integration capabilities

---

**Note**: These enhancements significantly improve lead management capabilities. Regular monitoring and maintenance of integrations will ensure optimal performance and data quality.