import { Request, Response } from "express";
export declare class InvoiceController {
    private generateInvoiceNumber;
    getInvoiceTemplate(req: Request, res: Response): Promise<void>;
    getAllInvoices(req: Request, res: Response): Promise<void>;
    getInvoiceById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    sendInvoice(req: Request, res: Response): Promise<void>;
    recordPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getInvoiceStats(req: Request, res: Response): Promise<void>;
    getOverdueInvoices(req: Request, res: Response): Promise<void>;
}
declare const _default: InvoiceController;
export default _default;
//# sourceMappingURL=invoiceController.d.ts.map