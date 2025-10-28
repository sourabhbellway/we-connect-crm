"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const businessSettingsController_1 = require("../controllers/businessSettingsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Get all business settings
router.get("/business-settings/all", businessSettingsController_1.businessSettingsController.getAllBusinessSettings);
// Company Settings
router.get("/business-settings/company", businessSettingsController_1.businessSettingsController.getCompanySettings);
router.put("/business-settings/company", businessSettingsController_1.businessSettingsController.updateCompanySettings);
// Currency Settings
router.get("/business-settings/currency", businessSettingsController_1.businessSettingsController.getCurrencySettings);
router.put("/business-settings/currency", businessSettingsController_1.businessSettingsController.updateCurrencySettings);
// Tax Settings
router.get("/business-settings/tax", businessSettingsController_1.businessSettingsController.getTaxSettings);
router.put("/business-settings/tax", businessSettingsController_1.businessSettingsController.updateTaxSettings);
// Lead Sources
router.get("/business-settings/lead-sources", businessSettingsController_1.businessSettingsController.getLeadSources);
router.post("/business-settings/lead-sources", businessSettingsController_1.businessSettingsController.createLeadSource);
router.put("/business-settings/lead-sources/:id", businessSettingsController_1.businessSettingsController.updateLeadSource);
router.delete("/business-settings/lead-sources/:id", businessSettingsController_1.businessSettingsController.deleteLeadSource);
// Pipelines
router.get("/business-settings/pipelines", businessSettingsController_1.businessSettingsController.getPipelines);
router.post("/business-settings/pipelines", businessSettingsController_1.businessSettingsController.createPipeline);
router.put("/business-settings/pipelines/:id", businessSettingsController_1.businessSettingsController.updatePipeline);
router.delete("/business-settings/pipelines/:id", businessSettingsController_1.businessSettingsController.deletePipeline);
// Email Templates
router.get("/business-settings/email-templates", businessSettingsController_1.businessSettingsController.getEmailTemplates);
// Quotation Templates
router.get("/business-settings/quotation-templates", businessSettingsController_1.businessSettingsController.getQuotationTemplates);
router.post("/business-settings/quotation-templates", businessSettingsController_1.businessSettingsController.createQuotationTemplate);
router.put("/business-settings/quotation-templates/:id", businessSettingsController_1.businessSettingsController.updateQuotationTemplate);
router.delete("/business-settings/quotation-templates/:id", businessSettingsController_1.businessSettingsController.deleteQuotationTemplate);
router.put("/business-settings/quotation-templates/:id/set-default", businessSettingsController_1.businessSettingsController.setDefaultQuotationTemplate);
// Invoice Templates
router.get("/business-settings/invoice-templates", businessSettingsController_1.businessSettingsController.getInvoiceTemplates);
// Proposal Templates
router.get("/business-settings/proposal-templates", businessSettingsController_1.businessSettingsController.getProposalTemplates);
// Notification Settings
router.get("/business-settings/notifications", businessSettingsController_1.businessSettingsController.getNotificationSettings);
// Automation Rules
router.get("/business-settings/automation-rules", businessSettingsController_1.businessSettingsController.getAutomationRules);
// Integration Settings (old mock endpoint)
router.get("/business-settings/integrations", businessSettingsController_1.businessSettingsController.getIntegrationSettings);
// New Integration Settings endpoints
router.get("/business-settings/settings", businessSettingsController_1.businessSettingsController.getBusinessSettingsFromDB);
router.put("/business-settings/settings", businessSettingsController_1.businessSettingsController.updateBusinessSettingsInDB);
router.get("/business-settings/integrations/available", businessSettingsController_1.businessSettingsController.getAvailableIntegrations);
router.get("/business-settings/integrations/status", businessSettingsController_1.businessSettingsController.getIntegrationStatus);
router.post("/business-settings/integrations/:integrationName/test", businessSettingsController_1.businessSettingsController.testIntegrationConnection);
router.post("/business-settings/integrations/sync-all", businessSettingsController_1.businessSettingsController.syncAllIntegrations);
router.post("/business-settings/integrations/:integrationName/sync", businessSettingsController_1.businessSettingsController.syncSpecificIntegration);
// Payment Gateway Settings
router.get("/business-settings/payment-gateways", businessSettingsController_1.businessSettingsController.getPaymentGatewaySettings);
exports.default = router;
//# sourceMappingURL=businessSettingsRoutes.js.map