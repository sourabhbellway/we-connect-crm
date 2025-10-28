import { Request, Response } from 'express';
import multer from 'multer';
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const upload: multer.Multer;
export declare const uploadFile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFiles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const downloadFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=fileController.d.ts.map