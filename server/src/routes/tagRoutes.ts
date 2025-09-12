import express from 'express';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController';
import { createTagValidation, updateTagValidation, deleteTagValidation } from '../validators/tagValidators';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all tags
router.get('/tags', authenticateToken, requirePermission('lead.read'), getTags);

// Create new tag
router.post('/tags', authenticateToken, requirePermission('lead.create'), createTagValidation, createTag);

// Update tag
router.put('/tags/:id', authenticateToken, requirePermission('lead.update'), updateTagValidation, updateTag);

// Delete tag
router.delete('/tags/:id', authenticateToken, requirePermission('lead.delete'), deleteTagValidation, deleteTag);

export default router;
