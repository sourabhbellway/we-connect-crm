import { Request, Response } from "express";
export declare const getTags: (req: Request, res: Response) => Promise<void>;
export declare const createTag: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTag: (req: Request, res: Response) => Promise<void>;
export declare const deleteTag: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=tagController.d.ts.map