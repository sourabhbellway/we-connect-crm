import { IntegrationsService } from './integrations.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
export declare class IntegrationsController {
    private readonly service;
    constructor(service: IntegrationsService);
    list(): Promise<{
        success: boolean;
        data: {
            items: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
                createdAt: Date;
                id: number;
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
