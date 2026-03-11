import { CommunicationProvidersService } from './communication-providers.service';
export declare class CommunicationProvidersController {
    private readonly service;
    constructor(service: CommunicationProvidersService);
    listProviders(): Promise<{
        success: boolean;
        data: {
            providers: {
                type: import(".prisma/client").$Enums.TemplateType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                companyId: number | null;
                isDefault: boolean;
                config: import("@prisma/client/runtime/library").JsonValue;
            }[];
        };
    }>;
    createProvider(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            provider: {
                type: import(".prisma/client").$Enums.TemplateType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                companyId: number | null;
                isDefault: boolean;
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
                type: import(".prisma/client").$Enums.TemplateType;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                companyId: number | null;
                isDefault: boolean;
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
