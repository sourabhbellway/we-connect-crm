import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            tokenExpiry: string;
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                id: number;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                companyId: number | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
            };
        };
        message?: undefined;
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        data: {
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                id: number;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                companyId: number | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
            };
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            accessToken: string;
            tokenExpiry: string;
        };
        message?: undefined;
    }>;
    logout(refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    profile(user: any): Promise<{
        success: boolean;
        data: {
            user: ({
                roles: {
                    id: number;
                    userId: number;
                    roleId: number;
                }[];
            } & {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                id: number;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                companyId: number | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
            }) | null;
        };
    }>;
}
