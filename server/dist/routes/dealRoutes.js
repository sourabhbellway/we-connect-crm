"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dealController_1 = require("../controllers/dealController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all deals with filtering
router.get('/deals', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.read'), dealController_1.getDeals);
// Get deal statistics
router.get('/deals/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.read'), dealController_1.getDealStats);
// Get deal by ID
router.get('/deals/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.read'), dealController_1.getDealById);
// Create new deal
router.post('/deals', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.create'), dealController_1.createDeal);
// Update deal
router.put('/deals/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.update'), dealController_1.updateDeal);
// Delete deal (soft delete)
router.delete('/deals/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('deal.delete'), dealController_1.deleteDeal);
exports.default = router;
//# sourceMappingURL=dealRoutes.js.map