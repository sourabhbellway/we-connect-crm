import { Request, Response } from "express";
export declare const getActivities: (req: Request, res: Response) => Promise<void>;
export declare const getRecentActivities: (req: Request, res: Response) => Promise<void>;
export declare const createActivity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getActivityStats: (req: Request, res: Response) => Promise<void>;
export declare const getDeletedData: (req: Request, res: Response) => Promise<void>;
export declare const cleanupOldDeletedRecords: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=activityController.d.ts.map