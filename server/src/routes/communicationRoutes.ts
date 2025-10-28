import express from 'express';
import {
  // Templates
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // Messages
  sendEmail,
  sendWhatsApp,
  sendTemplatedMessage,
  getMessages,
  getMessageStatus,
  
  // Automations
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  testAutomation,
  getAutomationStats,
  
  // Providers
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
} from '../controllers/communicationController';

import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Template routes
router.get('/templates', requirePermission('lead.read'), getTemplates);
router.post('/templates', requirePermission('lead.create'), createTemplate);
router.put('/templates/:id', requirePermission('lead.update'), updateTemplate);
router.delete('/templates/:id', requirePermission('lead.delete'), deleteTemplate);

// Message routes
router.post('/messages/email', requirePermission('lead.update'), sendEmail);
router.post('/messages/whatsapp', requirePermission('lead.update'), sendWhatsApp);
router.post('/messages/templated', requirePermission('lead.update'), sendTemplatedMessage);
router.get('/messages', requirePermission('lead.read'), getMessages);
router.get('/messages/:id/status', requirePermission('lead.read'), getMessageStatus);

// Automation routes
router.get('/automations', requirePermission('lead.read'), getAutomations);
router.post('/automations', requirePermission('lead.create'), createAutomation);
router.put('/automations/:id', requirePermission('lead.update'), updateAutomation);
router.delete('/automations/:id', requirePermission('lead.delete'), deleteAutomation);
router.post('/automations/:id/test', requirePermission('lead.update'), testAutomation);
router.get('/automations/:id/stats', requirePermission('lead.read'), getAutomationStats);
router.get('/automations/stats', requirePermission('lead.read'), getAutomationStats);

// Provider routes
router.get('/providers', requirePermission('lead.read'), getProviders);
router.post('/providers', requirePermission('lead.create'), createProvider);
router.put('/providers/:id', requirePermission('lead.update'), updateProvider);
router.delete('/providers/:id', requirePermission('lead.delete'), deleteProvider);
router.post('/providers/:id/test', requirePermission('lead.update'), testProvider);

export default router;