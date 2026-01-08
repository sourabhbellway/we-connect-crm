import { IntegrationsService } from './integrations.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    list(): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
            }[];
        };
    }>;
    create(dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    update(id: string, dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    logs(id: string): Promise<{
        success: boolean;
        data: {
            items: {
                data: import("@prisma/client/runtime/library").JsonValue | null;
                id: number;
                createdAt: Date;
                message: string | null;
                status: import("@prisma/client").$Enums.IntegrationLogStatus;
                operation: string;
                errorDetails: string | null;
                recordsCount: number | null;
                integrationId: number;
            }[];
        };
    }>;
}
