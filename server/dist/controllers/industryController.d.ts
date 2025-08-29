import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const getIndustries: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createIndustry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateIndustry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteIndustry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addIndustryField: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateIndustryField: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteIndustryField: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=industryController.d.ts.map