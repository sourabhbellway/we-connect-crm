import express from 'express';
import { 
  getLeadPipelineAnalytics,
  getLeadSourceAnalytics,
  getAgentPerformanceAnalytics,
  getLeadTrendAnalytics,
  getLeadConversionFunnel,
  getLeadActivityReport,
  getDashboardKPIs
} from '../controllers/leadAnalyticsController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Dashboard KPIs
router.get('/analytics/dashboard/kpis', authenticateToken, requirePermission('lead.read'), getDashboardKPIs);

// Lead pipeline analytics
router.get('/analytics/leads/pipeline', authenticateToken, requirePermission('lead.read'), getLeadPipelineAnalytics);

// Lead source performance analytics
router.get('/analytics/leads/sources', authenticateToken, requirePermission('lead.read'), getLeadSourceAnalytics);

// Agent performance analytics
router.get('/analytics/leads/agents', authenticateToken, requirePermission('lead.read'), getAgentPerformanceAnalytics);

// Lead trends analytics
router.get('/analytics/leads/trends', authenticateToken, requirePermission('lead.read'), getLeadTrendAnalytics);

// Lead conversion funnel
router.get('/analytics/leads/funnel', authenticateToken, requirePermission('lead.read'), getLeadConversionFunnel);

// Lead activity report
router.get('/analytics/leads/activity', authenticateToken, requirePermission('lead.read'), getLeadActivityReport);

export default router;