import { PrismaService } from '../../database/prisma.service';
export declare class CommunicationProvidersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listProviders(): Promise<{
        success: boolean;
        data: {
            providers: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                config: import("@prisma/client/runtime/library").JsonValue;
            }[];
        };
    }>;
    createProvider(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            provider: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                config: import("@prisma/client/runtime/library").JsonValue;
            };
        };
    }>;
    updateProvider(id: number, body: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            provider: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                companyId: number | null;
                name: string;
                isDefault: boolean;
                type: import("@prisma/client").$Enums.TemplateType;
                config: import("@prisma/client/runtime/library").JsonValue;
            };
        };
    }>;
    deleteProvider(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    testProvider(id: number, body: {
        testType?: string;
        recipient?: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
    }>;
}
