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
