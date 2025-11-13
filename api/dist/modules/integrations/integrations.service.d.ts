import { PrismaService } from '../../database/prisma.service';
import { UpsertIntegrationDto } from './dto/upsert-integration.dto';
export declare class IntegrationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    update(id: number, dto: UpsertIntegrationDto): Promise<{
        success: boolean;
        data: {
            integration: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                config: import("@prisma/client/runtime/library").JsonValue | null;
                displayName: string;
                apiEndpoint: string;
                authType: import("@prisma/client").$Enums.IntegrationAuthType;
            };
        };
    }>;
    logs(integrationId: number): Promise<{
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
