import express from 'express';
import multer from 'multer';
import { 
  getLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  deleteLead, 
  getLeadStats,
  transferLead,
  bulkAssignLeads,
  getLeadFollowUps,
  createLeadFollowUp,
  updateLeadFollowUp,
  getLeadCommunications,
  createLeadCommunication,
  downloadCSVTemplate,
  bulkImportLeads,
  exportLeads,
  getImportBatches,
  getImportBatchDetails,
  syncAllIntegrations,
  syncIntegration,
  testIntegration,
  getIntegrationLogs,
  convertLead
} from '../controllers/leadController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { 
  createLeadValidation, 
  updateLeadValidation, 
  deleteLeadValidation, 
  getLeadByIdValidation,
  convertLeadValidation
} from '../validators/leadValidators';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Only allow CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get lead statistics (specific route before parameterized routes)
router.get('/leads/stats', authenticateToken, requirePermission('lead.read'), getLeadStats);

// Bulk Import/Export Routes (specific routes before parameterized routes)
router.get('/leads/bulk/csv-template', authenticateToken, requirePermission('lead.create'), downloadCSVTemplate);
router.post('/leads/bulk/import', authenticateToken, requirePermission('lead.create'), upload.single('csvFile'), (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.',
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error',
    });
  }
  next();
}, bulkImportLeads);
router.get('/leads/bulk/export', authenticateToken, requirePermission('lead.read'), exportLeads);
router.get('/leads/bulk/import-batches', authenticateToken, requirePermission('lead.read'), getImportBatches);
router.get('/leads/bulk/import-batches/:batchId', authenticateToken, requirePermission('lead.read'), getImportBatchDetails);

// Bulk assign leads
router.put('/leads/bulk/assign', authenticateToken, requirePermission('lead.update'), bulkAssignLeads);

// Get all leads with pagination and filtering
router.get('/leads', authenticateToken, requirePermission('lead.read'), getLeads);

// Get lead by ID (parameterized route after specific routes)
router.get('/leads/:id', authenticateToken, requirePermission('lead.read'), getLeadByIdValidation, getLeadById);

// Create new lead
router.post('/leads', authenticateToken, requirePermission('lead.create'), createLeadValidation, createLead);

// Update lead
router.put('/leads/:id', authenticateToken, requirePermission('lead.update'), updateLeadValidation, updateLead);

// Transfer lead to another user
router.put('/leads/:id/transfer', authenticateToken, requirePermission('lead.update'), transferLead);

// Convert lead to contact, company, and deal
router.post('/leads/:id/convert', authenticateToken, requirePermission('lead.update'), convertLeadValidation, convertLead);

// Delete lead (soft delete)
router.delete('/leads/:id', authenticateToken, requirePermission('lead.delete'), deleteLeadValidation, deleteLead);

// Lead Follow-ups
router.get('/leads/:leadId/followups', authenticateToken, requirePermission('lead.read'), getLeadFollowUps);
router.post('/leads/:leadId/followups', authenticateToken, requirePermission('lead.update'), createLeadFollowUp);
router.put('/leads/:leadId/followups/:followUpId', authenticateToken, requirePermission('lead.update'), updateLeadFollowUp);

// Lead Communications
router.get('/leads/:leadId/communications', authenticateToken, requirePermission('lead.read'), getLeadCommunications);
router.post('/leads/:leadId/communications', authenticateToken, requirePermission('lead.update'), createLeadCommunication);

// Integration Routes
router.post('/leads/integrations/sync-all', authenticateToken, requirePermission('lead.create'), syncAllIntegrations);
router.post('/leads/integrations/:integrationName/sync', authenticateToken, requirePermission('lead.create'), syncIntegration);
router.post('/leads/integrations/:integrationName/test', authenticateToken, requirePermission('lead.read'), testIntegration);
router.get('/leads/integrations/logs', authenticateToken, requirePermission('lead.read'), getIntegrationLogs);

export default router;
