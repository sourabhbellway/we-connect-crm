import { Request, Response } from "express";
export declare class BusinessSettingsController {
    getAllBusinessSettings(req: Request, res: Response): Promise<void>;
    getCompanySettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCompanySettings(req: Request, res: Response): Promise<void>;
    getCurrencySettings(req: Request, res: Response): Promise<void>;
    updateCurrencySettings(req: Request, res: Response): Promise<void>;
    getTaxSettings(req: Request, res: Response): Promise<void>;
    updateTaxSettings(req: Request, res: Response): Promise<void>;
    getLeadSources(req: Request, res: Response): Promise<void>;
    createLeadSource(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateLeadSource(req: Request, res: Response): Promise<void>;
    deleteLeadSource(req: Request, res: Response): Promise<void>;
    getPipelines(req: Request, res: Response): Promise<void>;
    createPipeline(req: Request, res: Response): Promise<void>;
    updatePipeline(req: Request, res: Response): Promise<void>;
    deletePipeline(req: Request, res: Response): Promise<void>;
    getEmailTemplates(req: Request, res: Response): Promise<void>;
    getQuotationTemplates(req: Request, res: Response): Promise<void>;
    createQuotationTemplate(req: Request, res: Response): Promise<void>;
    updateQuotationTemplate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteQuotationTemplate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    setDefaultQuotationTemplate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getInvoiceTemplates(req: Request, res: Response): Promise<void>;
    getProposalTemplates(req: Request, res: Response): Promise<void>;
    getNotificationSettings(req: Request, res: Response): Promise<void>;
    getAutomationRules(req: Request, res: Response): Promise<void>;
    getIntegrationSettings(req: Request, res: Response): Promise<void>;
    getPaymentGatewaySettings(req: Request, res: Response): Promise<void>;
    getBusinessSettingsFromDB(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateBusinessSettingsInDB(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getIntegrationStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    testIntegrationConnection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAvailableIntegrations(req: Request, res: Response): Promise<void>;
    syncAllIntegrations(req: Request, res: Response): Promise<void>;
    syncSpecificIntegration(req: Request, res: Response): Promise<void>;
}
export declare const businessSettingsController: BusinessSettingsController;
//# sourceMappingURL=businessSettingsController.d.ts.map