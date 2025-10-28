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
export declare class PasswordValidator {
    private static defaultRequirements;
    static getBusinessPasswordRequirements(): Promise<PasswordRequirements>;
    static validatePassword(password: string, requirements?: PasswordRequirements): Promise<PasswordValidationResult>;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
    static generateSecureToken(length?: number): string;
    static checkPasswordHistory(userId: number, newPassword: string, historyCount?: number): Promise<boolean>;
    static savePasswordToHistory(userId: number, hashedPassword: string): Promise<void>;
}
export default PasswordValidator;
//# sourceMappingURL=passwordValidator.d.ts.map