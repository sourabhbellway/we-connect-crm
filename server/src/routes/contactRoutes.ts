import express from 'express';
import { 
  getContacts, 
  getContactById, 
  createContact, 
  updateContact, 
  deleteContact, 
  convertLeadToContact,
  getContactStats 
} from '../controllers/contactController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all contacts with filtering
router.get('/contacts', authenticateToken, requirePermission('contact.read'), getContacts);

// Get contact statistics
router.get('/contacts/stats', authenticateToken, requirePermission('contact.read'), getContactStats);

// Convert lead to contact
router.post('/leads/:leadId/convert', authenticateToken, requirePermission('lead.update'), convertLeadToContact);

// Get contact by ID
router.get('/contacts/:id', authenticateToken, requirePermission('contact.read'), getContactById);

// Create new contact
router.post('/contacts', authenticateToken, requirePermission('contact.create'), createContact);

// Update contact
router.put('/contacts/:id', authenticateToken, requirePermission('contact.update'), updateContact);

// Delete contact (soft delete)
router.delete('/contacts/:id', authenticateToken, requirePermission('contact.delete'), deleteContact);

export default router;