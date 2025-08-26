import express from 'express';
import { 
  getLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  deleteLead, 
  getLeadStats 
} from '../controllers/leadController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { 
  createLeadValidation, 
  updateLeadValidation, 
  deleteLeadValidation, 
  getLeadByIdValidation 
} from '../validators/leadValidators';

const router = express.Router();

// Get all leads with pagination and filtering
router.get('/leads', authenticateToken, requirePermission('lead.read'), getLeads);

// Get lead statistics
router.get('/leads/stats', authenticateToken, requirePermission('lead.read'), getLeadStats);

// Get lead by ID
router.get('/leads/:id', authenticateToken, requirePermission('lead.read'), getLeadByIdValidation, getLeadById);

// Create new lead
router.post('/leads', authenticateToken, requirePermission('lead.create'), createLeadValidation, createLead);

// Update lead
router.put('/leads/:id', authenticateToken, requirePermission('lead.update'), updateLeadValidation, updateLead);

// Delete lead (soft delete)
router.delete('/leads/:id', authenticateToken, requirePermission('lead.delete'), deleteLeadValidation, deleteLead);

export default router; 