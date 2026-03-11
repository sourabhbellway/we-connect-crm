import { PrismaService } from '../../database/prisma.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
export declare class IntegrationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        success: boolean;
        data: {
            items: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import(".prisma/client").$Enums.IntegrationAuthType;
            }[];
        };
    }>;
    create(dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import(".prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    update(id: number, dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import(".prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    logs(integrationId: number): Promise<{
        success: boolean;
        data: {
            items: {
                message: string | null;
                id: number;
                createdAt: Date;
                status: import(".prisma/client").$Enums.IntegrationLogStatus;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                operation: string;
                errorDetails: string | null;
                recordsCount: number | null;
                integrationId: number;
            }[];
        };
    }>;
}
