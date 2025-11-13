import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
                dateOfBirth: any;
                managerId: any;
                manager: {
                    id: any;
                    fullName: string;
                    email: any;
                } | null;
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
            dateOfBirth: any;
            managerId: any;
            manager: {
                id: any;
                fullName: string;
                email: any;
            } | null;
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
            dateOfBirth: any;
            managerId: any;
            manager: {
                id: any;
                fullName: string;
                email: any;
            } | null;
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
    create(dto: CreateUserDto): Promise<{
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
                dateOfBirth: Date | null;
                managerId: number | null;
            };
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
                dateOfBirth: Date | null;
                managerId: number | null;
            };
        };
        message?: undefined;
    }>;
    updateProfile(id: number, dto: {
        firstName?: string;
        lastName?: string;
        email?: string;
        dateOfBirth?: string | null;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
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
                dateOfBirth: Date | null;
                managerId: number | null;
            };
        };
        message?: undefined;
    }>;
    updateAvatar(id: number, fileName: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
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
                dateOfBirth: Date | null;
                managerId: number | null;
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
}
