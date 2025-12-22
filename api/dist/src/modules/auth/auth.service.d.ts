import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private tokenExpiryISO;
    private buildUserWithRoles;
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
                mustChangePassword: boolean;
                id?: number | undefined;
                email?: string | undefined;
                firstName?: string | undefined;
                lastName?: string | undefined;
                fullName?: string | undefined;
                lastLogin?: Date | null | undefined;
                profilePicture?: string | undefined;
                roles?: {
                    id: number;
                    name: string;
                    permissions: {
                        id: number;
                        name: string;
                        key: string;
                        module: string;
                    }[];
                }[] | undefined;
            };
        };
        message?: undefined;
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
                fullName: string;
                lastLogin: Date | null;
                profilePicture: string | undefined;
                mustChangePassword: any;
                roles: {
                    id: number;
                    name: string;
                    permissions: {
                        id: number;
                        name: string;
                        key: string;
                        module: string;
                    }[];
                }[];
            } | null;
        };
    }>;
    refreshToken(dto: RefreshDto): Promise<{
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
    profile(userId: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
                fullName: string;
                lastLogin: Date | null;
                profilePicture: string | undefined;
                mustChangePassword: any;
                roles: {
                    id: number;
                    name: string;
                    permissions: {
                        id: number;
                        name: string;
                        key: string;
                        module: string;
                    }[];
                }[];
            };
        };
        message?: undefined;
    }>;
}
