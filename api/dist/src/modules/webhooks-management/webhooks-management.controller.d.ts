import { WebhooksManagementService } from './webhooks-management.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
export declare class WebhooksManagementController {
    private readonly service;
    constructor(service: WebhooksManagementService);
    list(): Promise<{
        success: boolean;
        data: {
            webhooks: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                name: string;
                url: string;
                secret: string | null;
                events: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
        };
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            webhook: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                name: string;
                url: string;
                secret: string | null;
                events: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    create(dto: CreateWebhookDto): Promise<{
        success: boolean;
        data: {
            webhook: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                name: string;
                url: string;
                secret: string | null;
                events: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    update(id: number, dto: UpdateWebhookDto): Promise<{
        success: boolean;
        data: {
            webhook: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                deletedAt: Date | null;
                name: string;
                url: string;
                secret: string | null;
                events: import("@prisma/client/runtime/library").JsonValue | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    test(id: number): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
