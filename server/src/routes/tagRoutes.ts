import express from 'express';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all tags
router.get('/tags', authenticateToken, requirePermission('lead.read'), getTags);

// Create new tag
router.post('/tags', authenticateToken, requirePermission('lead.create'), createTag);

// Update tag
router.put('/tags/:id', authenticateToken, requirePermission('lead.update'), updateTag);

// Delete tag
router.delete('/tags/:id', authenticateToken, requirePermission('lead.delete'), deleteTag);

export default router;
