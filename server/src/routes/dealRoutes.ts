import express from 'express';
import { 
  getDeals, 
  getDealById, 
  createDeal, 
  updateDeal, 
  deleteDeal, 
  getDealStats 
} from '../controllers/dealController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all deals with filtering
router.get('/deals', authenticateToken, requirePermission('deal.read'), getDeals);

// Get deal statistics
router.get('/deals/stats', authenticateToken, requirePermission('deal.read'), getDealStats);

// Get deal by ID
router.get('/deals/:id', authenticateToken, requirePermission('deal.read'), getDealById);

// Create new deal
router.post('/deals', authenticateToken, requirePermission('deal.create'), createDeal);

// Update deal
router.put('/deals/:id', authenticateToken, requirePermission('deal.update'), updateDeal);

// Delete deal (soft delete)
router.delete('/deals/:id', authenticateToken, requirePermission('deal.delete'), deleteDeal);

export default router;