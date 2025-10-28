"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidator = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
class PasswordValidator {
    static async getBusinessPasswordRequirements() {
        try {
            const settings = await prisma_1.prisma.businessSettings.findFirst({
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
        }
        catch (error) {
            console.error('Error fetching business password requirements:', error);
            return this.defaultRequirements;
        }
    }
    static async validatePassword(password, requirements) {
        const reqs = requirements || await this.getBusinessPasswordRequirements();
        const errors = [];
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
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    static async comparePassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    static generateSecureToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    static async checkPasswordHistory(userId, newPassword, historyCount = 5) {
        try {
            const passwordHistory = await prisma_1.prisma.passwordHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: historyCount,
            });
            for (const historyEntry of passwordHistory) {
                if (await bcryptjs_1.default.compare(newPassword, historyEntry.password)) {
                    return false; // Password was used before
                }
            }
            return true; // Password is new
        }
        catch (error) {
            console.error('Error checking password history:', error);
            return true; // Allow password change if history check fails
        }
    }
    static async savePasswordToHistory(userId, hashedPassword) {
        try {
            await prisma_1.prisma.passwordHistory.create({
                data: {
                    userId,
                    password: hashedPassword,
                }
            });
            // Keep only last 5 passwords in history
            const allHistory = await prisma_1.prisma.passwordHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            if (allHistory.length > 5) {
                const toDelete = allHistory.slice(5);
                await prisma_1.prisma.passwordHistory.deleteMany({
                    where: {
                        id: {
                            in: toDelete.map(h => h.id)
                        }
                    }
                });
            }
        }
        catch (error) {
            console.error('Error saving password to history:', error);
        }
    }
}
exports.PasswordValidator = PasswordValidator;
PasswordValidator.defaultRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
};
exports.default = PasswordValidator;
//# sourceMappingURL=passwordValidator.js.map