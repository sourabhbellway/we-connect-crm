"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadSourceController_1 = require("../controllers/leadSourceController");
const auth_1 = require("../middleware/auth");
const leadSourceValidators_1 = require("../validators/leadSourceValidators");
const router = express_1.default.Router();
// Get all lead sources
router.get('/lead-sources', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadSourceController_1.getLeadSources);
// Create new lead source
router.post('/lead-sources', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.create'), leadSourceValidators_1.createLeadSourceValidation, leadSourceController_1.createLeadSource);
// Update lead source
router.put('/lead-sources/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.update'), leadSourceValidators_1.updateLeadSourceValidation, leadSourceController_1.updateLeadSource);
// Delete lead source
router.delete('/lead-sources/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.delete'), leadSourceValidators_1.deleteLeadSourceValidation, leadSourceController_1.deleteLeadSource);
exports.default = router;
//# sourceMappingURL=leadSourceRoutes.js.map