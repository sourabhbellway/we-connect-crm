import { Request, Response } from "express";
export declare const getContacts: (req: Request, res: Response) => Promise<void>;
export declare const getContactById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const convertLeadToContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getContactStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=contactController.d.ts.map