import { Request, Response } from 'express';
export declare const getCallLogsForLead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCallLogsForUser: (req: Request, res: Response) => Promise<void>;
export declare const createCallLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCallLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCallLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const initiateCall: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCallAnalytics: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=callLogController.d.ts.map