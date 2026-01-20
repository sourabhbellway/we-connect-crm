import { PrismaService } from '../../database/prisma.service';
import { UpsertProposalTemplateDto } from './dto/upsert-proposal-template.dto';
export declare class ProposalTemplatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
                description: string | null;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                content: string;
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
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            template: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
                description: string | null;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                content: string;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
                description: string | null;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                content: string;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            };
        };
    }>;
    update(id: number, dto: UpsertProposalTemplateDto): Promise<{
        success: boolean;
        data: {
            template: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
                description: string | null;
                isDefault: boolean;
                styles: import("@prisma/client/runtime/library").JsonValue | null;
                content: string;
                category: string | null;
                variables: import("@prisma/client/runtime/library").JsonValue | null;
                headerHtml: string | null;
                footerHtml: string | null;
                previewImage: string | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
