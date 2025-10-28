import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

interface LoginAttemptInfo {
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

export class SecurityMiddleware {
  // In-memory store for login attempts (in production, use Redis)
  private static loginAttempts = new Map<string, LoginAttemptInfo>();

  static async checkAccountLocked(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          accountLockedUntil: true,
          failedLoginAttempts: true,
        }
      });

      if (!user) return false;

      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        return true; // Account is locked
      }

      // If lock has expired, reset the lock
      if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
        await prisma.user.update({
          where: { email },
          data: {
            accountLockedUntil: null,
            failedLoginAttempts: 0,
          }
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  }

  static async recordFailedLogin(email: string): Promise<void> {
    try {
      const settings = await prisma.businessSettings.findFirst({
        select: {
          maxLoginAttempts: true,
          accountLockDuration: true,
        }
      });

      const maxAttempts = settings?.maxLoginAttempts || 5;
      const lockDuration = settings?.accountLockDuration || 30; // minutes

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          failedLoginAttempts: true,
        }
      });

      if (!user) return;

      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= maxAttempts;
      
      const updateData: any = {
        failedLoginAttempts: newAttempts,
      };

      if (shouldLock) {
        updateData.accountLockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);
      }

      await prisma.user.update({
        where: { email },
        data: updateData,
      });
    } catch (error) {
      console.error('Error recording failed login:', error);
    }
  }

  static async recordSuccessfulLogin(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
          lastLogin: new Date(),
        }
      });
    } catch (error) {
      console.error('Error recording successful login:', error);
    }
  }

  // Rate limiting middleware for login attempts
  static rateLimitLogin(maxAttempts: number = 5, windowMinutes: number = 15) {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `login_${clientIP}`;
      const now = new Date();

      const attemptInfo = this.loginAttempts.get(key);

      if (attemptInfo) {
        const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
        
        // Reset if outside window
        if (attemptInfo.lastAttempt < windowStart) {
          this.loginAttempts.set(key, { attempts: 1, lastAttempt: now });
          return next();
        }

        // Check if exceeded max attempts
        if (attemptInfo.attempts >= maxAttempts) {
          return res.status(429).json({
            success: false,
            message: `Too many login attempts. Please try again in ${windowMinutes} minutes.`,
            retryAfter: windowMinutes * 60,
          });
        }

        // Increment attempts
        this.loginAttempts.set(key, {
          attempts: attemptInfo.attempts + 1,
          lastAttempt: now,
        });
      } else {
        // First attempt
        this.loginAttempts.set(key, { attempts: 1, lastAttempt: now });
      }

      next();
    };
  }

  // General rate limiting middleware
  static rateLimit(maxRequests: number = 100, windowMinutes: number = 15) {
    const requests = new Map<string, { count: number; resetTime: Date }>();

    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const now = new Date();
      const resetTime = new Date(now.getTime() + windowMinutes * 60 * 1000);

      const requestInfo = requests.get(clientIP);

      if (requestInfo) {
        if (now < requestInfo.resetTime) {
          if (requestInfo.count >= maxRequests) {
            return res.status(429).json({
              success: false,
              message: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((requestInfo.resetTime.getTime() - now.getTime()) / 1000),
            });
          }
          requestInfo.count += 1;
        } else {
          // Reset window
          requests.set(clientIP, { count: 1, resetTime });
        }
      } else {
        // First request
        requests.set(clientIP, { count: 1, resetTime });
      }

      next();
    };
  }

  // Clean up old attempts periodically
  static startCleanup() {
    setInterval(() => {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      for (const [key, info] of this.loginAttempts.entries()) {
        if (info.lastAttempt < fifteenMinutesAgo) {
          this.loginAttempts.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  // Validate device fingerprint for additional security
  static deviceValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      const deviceId = req.headers['x-device-id'] as string;
      const userAgent = req.headers['user-agent'];
      
      // For now, just add to request object for logging
      (req as any).deviceInfo = {
        deviceId,
        userAgent,
        ipAddress: req.ip,
      };

      next();
    };
  }

  // CSRF protection for state-changing operations
  static csrfProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const csrfToken = req.headers['x-csrf-token'] as string;
        const sessionCsrf = (req as any).session?.csrfToken;

        if (!csrfToken || csrfToken !== sessionCsrf) {
          return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token',
          });
        }
      }
      next();
    };
  }
}

export default SecurityMiddleware;