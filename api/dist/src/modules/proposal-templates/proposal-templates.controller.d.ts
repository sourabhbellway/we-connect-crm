import { ProposalTemplatesService } from './proposal-templates.service';
import { UpsertProposalTemplateDto } from './dto/upsert-proposal-template.dto';
export declare class ProposalTemplatesController {
    private readonly service;
    constructor(service: ProposalTemplatesService);
    list(page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: {
            items: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                content: string;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    get(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            template: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                content: string;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: UpsertProposalTemplateDto): Promise<{
        success: boolean;
        data: {
            template: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                content: string;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            };
        };
    }>;
    update(id: string, dto: UpsertProposalTemplateDto): Promise<{
        success: boolean;
        data: {
            template: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                content: string;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
