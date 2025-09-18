import express from 'express';
import { 
  getLeadSources, 
  createLeadSource, 
  updateLeadSource, 
  deleteLeadSource 
} from '../controllers/leadSourceController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { createLeadSourceValidation, deleteLeadSourceValidation, updateLeadSourceValidation } from '../validators/leadSourceValidators';

const router = express.Router();

// Get all lead sources
router.get('/lead-sources', authenticateToken, requirePermission('lead.read'), getLeadSources);

// Create new lead source
router.post('/lead-sources', authenticateToken, requirePermission('lead.create'), createLeadSourceValidation, createLeadSource);

// Update lead source
router.put('/lead-sources/:id', authenticateToken, requirePermission('lead.update'), updateLeadSourceValidation, updateLeadSource);

// Delete lead source
router.delete('/lead-sources/:id', authenticateToken, requirePermission('lead.delete'), deleteLeadSourceValidation, deleteLeadSource);

export default router;
