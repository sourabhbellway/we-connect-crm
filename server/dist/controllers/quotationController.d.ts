import { Request, Response } from "express";
export declare class QuotationController {
    private generateQuotationNumber;
    getQuotationTemplate(req: Request, res: Response): Promise<void>;
    getAllQuotations(req: Request, res: Response): Promise<void>;
    getQuotationById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createQuotation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateQuotation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    sendQuotation(req: Request, res: Response): Promise<void>;
    acceptQuotation(req: Request, res: Response): Promise<void>;
    rejectQuotation(req: Request, res: Response): Promise<void>;
    deleteQuotation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getQuotationStats(req: Request, res: Response): Promise<void>;
    downloadQuotationPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    previewQuotationPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: QuotationController;
export default _default;
//# sourceMappingURL=quotationController.d.ts.map