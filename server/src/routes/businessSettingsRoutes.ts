import express from "express";
import { businessSettingsController } from "../controllers/businessSettingsController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all business settings
router.get("/business-settings/all", businessSettingsController.getAllBusinessSettings);

// Company Settings
router.get("/business-settings/company", businessSettingsController.getCompanySettings);
router.put("/business-settings/company", businessSettingsController.updateCompanySettings);

// Currency Settings
router.get("/business-settings/currency", businessSettingsController.getCurrencySettings);
router.put("/business-settings/currency", businessSettingsController.updateCurrencySettings);

// Tax Settings
router.get("/business-settings/tax", businessSettingsController.getTaxSettings);
router.put("/business-settings/tax", businessSettingsController.updateTaxSettings);

// Lead Sources
router.get("/business-settings/lead-sources", businessSettingsController.getLeadSources);
router.post("/business-settings/lead-sources", businessSettingsController.createLeadSource);
router.put("/business-settings/lead-sources/:id", businessSettingsController.updateLeadSource);
router.delete("/business-settings/lead-sources/:id", businessSettingsController.deleteLeadSource);

// Pipelines
router.get("/business-settings/pipelines", businessSettingsController.getPipelines);
router.post("/business-settings/pipelines", businessSettingsController.createPipeline);
router.put("/business-settings/pipelines/:id", businessSettingsController.updatePipeline);
router.delete("/business-settings/pipelines/:id", businessSettingsController.deletePipeline);

// Email Templates
router.get("/business-settings/email-templates", businessSettingsController.getEmailTemplates);

// Quotation Templates
router.get("/business-settings/quotation-templates", businessSettingsController.getQuotationTemplates);
router.post("/business-settings/quotation-templates", businessSettingsController.createQuotationTemplate);
router.put("/business-settings/quotation-templates/:id", businessSettingsController.updateQuotationTemplate);
router.delete("/business-settings/quotation-templates/:id", businessSettingsController.deleteQuotationTemplate);
router.put("/business-settings/quotation-templates/:id/set-default", businessSettingsController.setDefaultQuotationTemplate);

// Invoice Templates
router.get("/business-settings/invoice-templates", businessSettingsController.getInvoiceTemplates);

// Proposal Templates
router.get("/business-settings/proposal-templates", businessSettingsController.getProposalTemplates);

// Notification Settings
router.get("/business-settings/notifications", businessSettingsController.getNotificationSettings);

// Automation Rules
router.get("/business-settings/automation-rules", businessSettingsController.getAutomationRules);

// Integration Settings (old mock endpoint)
router.get("/business-settings/integrations", businessSettingsController.getIntegrationSettings);

// New Integration Settings endpoints
router.get("/business-settings/settings", businessSettingsController.getBusinessSettingsFromDB);
router.put("/business-settings/settings", businessSettingsController.updateBusinessSettingsInDB);
router.get("/business-settings/integrations/available", businessSettingsController.getAvailableIntegrations);
router.get("/business-settings/integrations/status", businessSettingsController.getIntegrationStatus);
router.post("/business-settings/integrations/:integrationName/test", businessSettingsController.testIntegrationConnection);
router.post("/business-settings/integrations/sync-all", businessSettingsController.syncAllIntegrations);
router.post("/business-settings/integrations/:integrationName/sync", businessSettingsController.syncSpecificIntegration);

// Payment Gateway Settings
router.get("/business-settings/payment-gateways", businessSettingsController.getPaymentGatewaySettings);

export default router;
