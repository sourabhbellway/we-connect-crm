import express from 'express';
import {
  getCallLogsForLead,
  getCallLogsForUser,
  createCallLog,
  updateCallLog,
  deleteCallLog,
  initiateCall,
  getCallAnalytics,
} from '../controllers/callLogController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get call logs for a specific lead
router.get(
  '/lead/:leadId',
  requirePermission('lead.read'),
  getCallLogsForLead
);

// Get all call logs for the authenticated user
router.get(
  '/user',
  getCallLogsForUser
);

// Create a new call log
router.post(
  '/',
  requirePermission('lead.update'),
  createCallLog
);

// Update a call log
router.put(
  '/:id',
  requirePermission('lead.update'),
  updateCallLog
);

// Delete a call log
router.delete(
  '/:id',
  requirePermission('lead.delete'),
  deleteCallLog
);

// Initiate a call and send notification to mobile app
router.post(
  '/initiate',
  requirePermission('lead.update'),
  initiateCall
);

// Get call analytics
router.get(
  '/analytics',
  getCallAnalytics
);

export default router;