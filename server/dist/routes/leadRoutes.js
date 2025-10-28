"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const leadController_1 = require("../controllers/leadController");
const auth_1 = require("../middleware/auth");
const leadValidators_1 = require("../validators/leadValidators");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        // Only allow CSV files
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Get lead statistics (specific route before parameterized routes)
router.get('/leads/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeadStats);
// Bulk Import/Export Routes (specific routes before parameterized routes)
router.get('/leads/bulk/csv-template', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadController_1.downloadCSVTemplate);
router.post('/leads/bulk/import', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), upload.single('csvFile'), (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB.',
            });
        }
    }
    else if (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'File upload error',
        });
    }
    next();
}, leadController_1.bulkImportLeads);
router.get('/leads/bulk/export', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.exportLeads);
router.get('/leads/bulk/import-batches', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getImportBatches);
router.get('/leads/bulk/import-batches/:batchId', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getImportBatchDetails);
// Bulk assign leads
router.put('/leads/bulk/assign', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadController_1.bulkAssignLeads);
// Get all leads with pagination and filtering
router.get('/leads', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeads);
// Get lead by ID (parameterized route after specific routes)
router.get('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadValidators_1.getLeadByIdValidation, leadController_1.getLeadById);
// Create new lead
router.post('/leads', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadValidators_1.createLeadValidation, leadController_1.createLead);
// Update lead
router.put('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadValidators_1.updateLeadValidation, leadController_1.updateLead);
// Transfer lead to another user
router.put('/leads/:id/transfer', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadController_1.transferLead);
// Convert lead to contact, company, and deal
router.post('/leads/:id/convert', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadValidators_1.convertLeadValidation, leadController_1.convertLead);
// Delete lead (soft delete)
router.delete('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.delete'), leadValidators_1.deleteLeadValidation, leadController_1.deleteLead);
// Lead Follow-ups
router.get('/leads/:leadId/followups', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeadFollowUps);
router.post('/leads/:leadId/followups', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadController_1.createLeadFollowUp);
router.put('/leads/:leadId/followups/:followUpId', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadController_1.updateLeadFollowUp);
// Lead Communications
router.get('/leads/:leadId/communications', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeadCommunications);
router.post('/leads/:leadId/communications', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadController_1.createLeadCommunication);
// Integration Routes
router.post('/leads/integrations/sync-all', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadController_1.syncAllIntegrations);
router.post('/leads/integrations/:integrationName/sync', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadController_1.syncIntegration);
router.post('/leads/integrations/:integrationName/test', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.testIntegration);
router.get('/leads/integrations/logs', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getIntegrationLogs);
exports.default = router;
//# sourceMappingURL=leadRoutes.js.map