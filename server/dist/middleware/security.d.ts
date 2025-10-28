import { Request, Response, NextFunction } from 'express';
export declare class SecurityMiddleware {
    private static loginAttempts;
    static checkAccountLocked(email: string): Promise<boolean>;
    static recordFailedLogin(email: string): Promise<void>;
    static recordSuccessfulLogin(email: string): Promise<void>;
    static rateLimitLogin(maxAttempts?: number, windowMinutes?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    static rateLimit(maxRequests?: number, windowMinutes?: number): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static startCleanup(): void;
    static deviceValidation(): (req: Request, res: Response, next: NextFunction) => void;
    static csrfProtection(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
}
export default SecurityMiddleware;
//# sourceMappingURL=security.d.ts.map