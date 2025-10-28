"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const callLogController_1 = require("../controllers/callLogController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get call logs for a specific lead
router.get('/lead/:leadId', (0, auth_1.requirePermission)('lead.read'), callLogController_1.getCallLogsForLead);
// Get all call logs for the authenticated user
router.get('/user', callLogController_1.getCallLogsForUser);
// Create a new call log
router.post('/', (0, auth_1.requirePermission)('lead.update'), callLogController_1.createCallLog);
// Update a call log
router.put('/:id', (0, auth_1.requirePermission)('lead.update'), callLogController_1.updateCallLog);
// Delete a call log
router.delete('/:id', (0, auth_1.requirePermission)('lead.delete'), callLogController_1.deleteCallLog);
// Initiate a call and send notification to mobile app
router.post('/initiate', (0, auth_1.requirePermission)('lead.update'), callLogController_1.initiateCall);
// Get call analytics
router.get('/analytics', callLogController_1.getCallAnalytics);
exports.default = router;
//# sourceMappingURL=callLogRoutes.js.map