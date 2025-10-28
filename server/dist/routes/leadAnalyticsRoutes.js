"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadAnalyticsController_1 = require("../controllers/leadAnalyticsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Dashboard KPIs
router.get('/analytics/dashboard/kpis', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getDashboardKPIs);
// Lead pipeline analytics
router.get('/analytics/leads/pipeline', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getLeadPipelineAnalytics);
// Lead source performance analytics
router.get('/analytics/leads/sources', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getLeadSourceAnalytics);
// Agent performance analytics
router.get('/analytics/leads/agents', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getAgentPerformanceAnalytics);
// Lead trends analytics
router.get('/analytics/leads/trends', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getLeadTrendAnalytics);
// Lead conversion funnel
router.get('/analytics/leads/funnel', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getLeadConversionFunnel);
// Lead activity report
router.get('/analytics/leads/activity', auth_1.authenticateToken, (0, auth_1.requirePermission)('lead.read'), leadAnalyticsController_1.getLeadActivityReport);
exports.default = router;
//# sourceMappingURL=leadAnalyticsRoutes.js.map