import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: string, limit?: string, search?: string, status?: string, isDeleted?: string): Promise<{
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
    getMyProfile(user: any): Promise<{
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
    updateMyProfile(user: any, dto: UpdateProfileDto): Promise<{
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
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerificationToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                passwordResetToken: string | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                mustChangePassword: boolean;
                id: number;
                companyId: number | null;
                managerId: number | null;
                teamId: number | null;
            };
        };
        message?: undefined;
    }>;
    changeMyPassword(user: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        data: {
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerificationToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                passwordResetToken: string | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                mustChangePassword: boolean;
                id: number;
                companyId: number | null;
                managerId: number | null;
                teamId: number | null;
            };
        };
    }>;
    changePasswordForNewUser(user: any, dto: {
        newPassword: string;
    }): Promise<{
        success: boolean;
        data: {
            user: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerificationToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                passwordResetToken: string | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                mustChangePassword: boolean;
                id: number;
                companyId: number | null;
                managerId: number | null;
                teamId: number | null;
            };
        };
    }>;
    uploadAvatar(user: any, file?: Express.Multer.File): Promise<{
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
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerificationToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                passwordResetToken: string | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                mustChangePassword: boolean;
                id: number;
                companyId: number | null;
                managerId: number | null;
                teamId: number | null;
            };
        };
        message?: undefined;
    }>;
    findOne(id: string): Promise<{
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
    assignRoles(id: string, roleIds: number[]): Promise<{
        success: boolean;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
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
                isActive: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
                profilePicture: string | null;
                deletedAt: Date | null;
                accountLockedUntil: Date | null;
                emailVerificationToken: string | null;
                emailVerified: boolean;
                emailVerifiedAt: Date | null;
                failedLoginAttempts: number;
                passwordResetExpires: Date | null;
                passwordResetToken: string | null;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                mustChangePassword: boolean;
                id: number;
                companyId: number | null;
                managerId: number | null;
                teamId: number | null;
            };
        };
        message?: undefined;
    }>;
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
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    restore(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePermanently(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
