import { Request, Response } from "express";
export declare const getPermissions: (req: Request, res: Response) => Promise<void>;
export declare const createPermission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePermission: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePermission: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=permissionController.d.ts.map