import { Request, Response } from "express";
export declare const getCompanies: (req: Request, res: Response) => Promise<void>;
export declare const getCompanyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCompanyStats: (req: Request, res: Response) => Promise<void>;
export declare const getCompanyActivities: (req: Request, res: Response) => Promise<void>;
export declare const createCompanyActivity: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=companyController.d.ts.map