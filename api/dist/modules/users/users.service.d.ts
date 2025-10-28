import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOne(id: number): Promise<{
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
    } | null>;
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
            };
        };
    }>;
}
