import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordValidator {
  private static defaultRequirements: PasswordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  };

  static async getBusinessPasswordRequirements(): Promise<PasswordRequirements> {
    try {
      const settings = await prisma.businessSettings.findFirst({
        select: {
          passwordMinLength: true,
          passwordRequireUpper: true,
          passwordRequireLower: true,
          passwordRequireNumber: true,
          passwordRequireSymbol: true,
        }
      });

      if (!settings) {
        return this.defaultRequirements;
      }

      return {
        minLength: settings.passwordMinLength,
        requireUppercase: settings.passwordRequireUpper,
        requireLowercase: settings.passwordRequireLower,
        requireNumbers: settings.passwordRequireNumber,
        requireSymbols: settings.passwordRequireSymbol,
      };
    } catch (error) {
      console.error('Error fetching business password requirements:', error);
      return this.defaultRequirements;
    }
  }

  static async validatePassword(
    password: string, 
    requirements?: PasswordRequirements
  ): Promise<PasswordValidationResult> {
    const reqs = requirements || await this.getBusinessPasswordRequirements();
    const errors: string[] = [];

    // Check minimum length
    if (password.length < reqs.minLength) {
      errors.push(`Password must be at least ${reqs.minLength} characters long`);
    }

    // Check for uppercase letter
    if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (reqs.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (reqs.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special character
    if (reqs.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', '123456789', 'welcome', 'admin', 'letmein'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more secure password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static async checkPasswordHistory(userId: number, newPassword: string, historyCount: number = 5): Promise<boolean> {
    try {
      const passwordHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: historyCount,
      });

      for (const historyEntry of passwordHistory) {
        if (await bcrypt.compare(newPassword, historyEntry.password)) {
          return false; // Password was used before
        }
      }

      return true; // Password is new
    } catch (error) {
      console.error('Error checking password history:', error);
      return true; // Allow password change if history check fails
    }
  }

  static async savePasswordToHistory(userId: number, hashedPassword: string): Promise<void> {
    try {
      await prisma.passwordHistory.create({
        data: {
          userId,
          password: hashedPassword,
        }
      });

      // Keep only last 5 passwords in history
      const allHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (allHistory.length > 5) {
        const toDelete = allHistory.slice(5);
        await prisma.passwordHistory.deleteMany({
          where: {
            id: {
              in: toDelete.map(h => h.id)
            }
          }
        });
      }
    } catch (error) {
      console.error('Error saving password to history:', error);
    }
  }
}

export default PasswordValidator;