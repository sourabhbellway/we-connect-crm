import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ActivitiesService } from '../activities/activities.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly activitiesService;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, activitiesService: ActivitiesService, config: ConfigService);
    private tokenExpiryISO;
    private generateAuthTokens;
    private buildUserWithRoles;
    login(dto: LoginDto): Promise<{
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
        data: {
            accessToken: string;
            refreshToken: string;
            tokenExpiry: string;
        };
    }>;
    logout(refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    profile(userId: number): Promise<{
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
    }>;
}
