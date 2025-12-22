import { CommunicationProvidersService } from './communication-providers.service';
export declare class CommunicationProvidersController {
    private readonly service;
    constructor(service: CommunicationProvidersService);
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
    updateProvider(id: string, body: any): Promise<{
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
    deleteProvider(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testProvider(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
    }>;
}
