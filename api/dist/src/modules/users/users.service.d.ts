import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessSettingsService } from '../business-settings/business-settings.service';
export declare class UsersService {
    private readonly prisma;
    private readonly businessSettingsService;
    private readonly logger;
    constructor(prisma: PrismaService, businessSettingsService: BusinessSettingsService);
    private renderTemplate;
    private mapUser;
    findAll({ page, limit, search, status, isDeleted, }?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: 'active' | 'inactive' | string;
        isDeleted?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            users: ({
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                fullName: string;
                isActive: any;
                lastLogin: any;
                managerId: any;
                manager: {
                    id: any;
                    fullName: string;
                    email: any;
                } | null;
                teamId: any;
                team: {
                    id: any;
                    name: any;
                } | null;
                teamSize: any;
                roles: any;
                createdAt: any;
                updatedAt: any;
                deletedAt: any;
            } | null)[];
            pagination: {
                totalItems: number;
                currentPage: number;
                pageSize: number;
                totalPages: number;
            };
        };
    } | {
        success: boolean;
        data: ({
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            fullName: string;
            isActive: any;
            lastLogin: any;
            managerId: any;
            manager: {
                id: any;
                fullName: string;
                email: any;
            } | null;
            teamId: any;
            team: {
                id: any;
                name: any;
            } | null;
            teamSize: any;
            roles: any;
            createdAt: any;
            updatedAt: any;
            deletedAt: any;
        } | null)[];
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            stats: {
                totalUsers: number;
                activeUsers: number;
                inactiveUsers: number;
                newUsers: number;
            };
        };
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            fullName: string;
            isActive: any;
            lastLogin: any;
            managerId: any;
            manager: {
                id: any;
                fullName: string;
                email: any;
            } | null;
            teamId: any;
            team: {
                id: any;
                name: any;
            } | null;
            teamSize: any;
            roles: any;
            createdAt: any;
            updatedAt: any;
            deletedAt: any;
        } | null;
        message?: undefined;
    }>;
    assignRoles(userId: number, roleIds: number[]): Promise<{
        success: boolean;
    }>;
    private generateRandomPassword;
    private sendEmail;
    create(dto: CreateUserDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                fullName: string;
                isActive: any;
                lastLogin: any;
                managerId: any;
                manager: {
                    id: any;
                    fullName: string;
                    email: any;
                } | null;
                teamId: any;
                team: {
                    id: any;
                    name: any;
                } | null;
                teamSize: any;
                roles: any;
                createdAt: any;
                updatedAt: any;
                deletedAt: any;
            } | null;
        };
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                password: string;
                firstName: string;
                lastName: string;
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
                deviceToken: string | null;
                fcmToken: string | null;
                managerId: number | null;
                mustChangePassword: boolean;
                teamId: number | null;
                language: string;
                firstNameAr: string | null;
                lastNameAr: string | null;
            };
        };
        message?: undefined;
    }>;
    updateProfile(id: number, dto: {
        firstName?: string;
        lastName?: string;
        email?: string;
        language?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                password: string;
                firstName: string;
                lastName: string;
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
                deviceToken: string | null;
                fcmToken: string | null;
                managerId: number | null;
                mustChangePassword: boolean;
                teamId: number | null;
                language: string;
                firstNameAr: string | null;
                lastNameAr: string | null;
            };
        };
        message?: undefined;
    }>;
    changePasswordForUser(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                password: string;
                firstName: string;
                lastName: string;
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
                deviceToken: string | null;
                fcmToken: string | null;
                managerId: number | null;
                mustChangePassword: boolean;
                teamId: number | null;
                language: string;
                firstNameAr: string | null;
                lastNameAr: string | null;
            };
        };
    }>;
    changePasswordForNewUser(userId: number, newPassword: string): Promise<{
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                password: string;
                firstName: string;
                lastName: string;
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
                deviceToken: string | null;
                fcmToken: string | null;
                managerId: number | null;
                mustChangePassword: boolean;
                teamId: number | null;
                language: string;
                firstNameAr: string | null;
                lastNameAr: string | null;
            };
        };
    }>;
    updateAvatar(id: number, fileName: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                emailVerificationToken: string | null;
                passwordResetToken: string | null;
                password: string;
                firstName: string;
                lastName: string;
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
                deviceToken: string | null;
                fcmToken: string | null;
                managerId: number | null;
                mustChangePassword: boolean;
                teamId: number | null;
                language: string;
                firstNameAr: string | null;
                lastNameAr: string | null;
            };
        };
        message?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    restore(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePermanently(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
