import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const superAdminLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSuperAdminProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=superAdminAuthController.d.ts.map