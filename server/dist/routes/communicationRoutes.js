"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const communicationController_1 = require("../controllers/communicationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Template routes
router.get('/templates', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getTemplates);
router.post('/templates', (0, auth_1.requirePermission)('lead.create'), communicationController_1.createTemplate);
router.put('/templates/:id', (0, auth_1.requirePermission)('lead.update'), communicationController_1.updateTemplate);
router.delete('/templates/:id', (0, auth_1.requirePermission)('lead.delete'), communicationController_1.deleteTemplate);
// Message routes
router.post('/messages/email', (0, auth_1.requirePermission)('lead.update'), communicationController_1.sendEmail);
router.post('/messages/whatsapp', (0, auth_1.requirePermission)('lead.update'), communicationController_1.sendWhatsApp);
router.post('/messages/templated', (0, auth_1.requirePermission)('lead.update'), communicationController_1.sendTemplatedMessage);
router.get('/messages', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getMessages);
router.get('/messages/:id/status', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getMessageStatus);
// Automation routes
router.get('/automations', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getAutomations);
router.post('/automations', (0, auth_1.requirePermission)('lead.create'), communicationController_1.createAutomation);
router.put('/automations/:id', (0, auth_1.requirePermission)('lead.update'), communicationController_1.updateAutomation);
router.delete('/automations/:id', (0, auth_1.requirePermission)('lead.delete'), communicationController_1.deleteAutomation);
router.post('/automations/:id/test', (0, auth_1.requirePermission)('lead.update'), communicationController_1.testAutomation);
router.get('/automations/:id/stats', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getAutomationStats);
router.get('/automations/stats', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getAutomationStats);
// Provider routes
router.get('/providers', (0, auth_1.requirePermission)('lead.read'), communicationController_1.getProviders);
router.post('/providers', (0, auth_1.requirePermission)('lead.create'), communicationController_1.createProvider);
router.put('/providers/:id', (0, auth_1.requirePermission)('lead.update'), communicationController_1.updateProvider);
router.delete('/providers/:id', (0, auth_1.requirePermission)('lead.delete'), communicationController_1.deleteProvider);
router.post('/providers/:id/test', (0, auth_1.requirePermission)('lead.update'), communicationController_1.testProvider);
exports.default = router;
//# sourceMappingURL=communicationRoutes.js.map