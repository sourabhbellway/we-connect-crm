"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadController_1 = require("../controllers/leadController");
const auth_1 = require("../middleware/auth");
const leadValidators_1 = require("../validators/leadValidators");
const router = express_1.default.Router();
// Get all leads with pagination and filtering
router.get('/leads', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeads);
// Get lead statistics
router.get('/leads/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadController_1.getLeadStats);
// Get lead by ID
router.get('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadValidators_1.getLeadByIdValidation, leadController_1.getLeadById);
// Create new lead
router.post('/leads', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadValidators_1.createLeadValidation, leadController_1.createLead);
// Update lead
router.put('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadValidators_1.updateLeadValidation, leadController_1.updateLead);
// Delete lead (soft delete)
router.delete('/leads/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.delete'), leadValidators_1.deleteLeadValidation, leadController_1.deleteLead);
exports.default = router;
//# sourceMappingURL=leadRoutes.js.map