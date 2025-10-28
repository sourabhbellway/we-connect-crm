import { Request, Response } from "express";
export declare const getDeals: (req: Request, res: Response) => Promise<void>;
export declare const getDealById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createDeal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDeal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDeal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDealStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=dealController.d.ts.map