import { Request, Response } from "express";
export declare class ProposalTemplateController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    setDefault(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    duplicate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const proposalTemplateController: ProposalTemplateController;
//# sourceMappingURL=proposalTemplateController.d.ts.map