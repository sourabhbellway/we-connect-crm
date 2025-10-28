import express from 'express';
import { 
  getCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  getCompanyStats,
  getCompanyActivities,
  createCompanyActivity
} from '../controllers/companyController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all companies with filtering
router.get('/companies', authenticateToken, requirePermission('company.read'), getCompanies);

// Get company statistics
router.get('/companies/stats', authenticateToken, requirePermission('company.read'), getCompanyStats);

// Get company by ID
router.get('/companies/:id', authenticateToken, requirePermission('company.read'), getCompanyById);

// Create new company
router.post('/companies', authenticateToken, requirePermission('company.create'), createCompany);

// Update company
router.put('/companies/:id', authenticateToken, requirePermission('company.update'), updateCompany);

// Delete company (soft delete)
router.delete('/companies/:id', authenticateToken, requirePermission('company.delete'), deleteCompany);

// Get company activities
router.get('/companies/:id/activities', authenticateToken, requirePermission('company.read'), getCompanyActivities);

// Create company activity
router.post('/companies/:id/activities', authenticateToken, requirePermission('company.update'), createCompanyActivity);

export default router;