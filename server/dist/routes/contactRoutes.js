"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactController_1 = require("../controllers/contactController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all contacts with filtering
router.get('/contacts', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.read'), contactController_1.getContacts);
// Get contact statistics
router.get('/contacts/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.read'), contactController_1.getContactStats);
// Convert lead to contact
router.post('/leads/:leadId/convert', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), contactController_1.convertLeadToContact);
// Get contact by ID
router.get('/contacts/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.read'), contactController_1.getContactById);
// Create new contact
router.post('/contacts', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.create'), contactController_1.createContact);
// Update contact
router.put('/contacts/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.update'), contactController_1.updateContact);
// Delete contact (soft delete)
router.delete('/contacts/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('contact.delete'), contactController_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map