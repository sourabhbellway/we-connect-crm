import { IntegrationsService } from './integrations.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    list(): Promise<{
        success: boolean;
        data: {
            items: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
                config: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
        };
    }>;
    create(dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
                config: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    update(id: string, dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
                config: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    logs(id: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                message: string | null;
                status: import("@prisma/client").$Enums.IntegrationLogStatus;
                integrationId: number;
                operation: string;
                errorDetails: string | null;
                recordsCount: number | null;
            }[];
        };
    }>;
}
