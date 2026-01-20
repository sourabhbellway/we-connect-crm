import { PrismaService } from '../../database/prisma.service';
export declare class TrashService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll({ page, limit, type, search, }: {
        page?: number;
        limit?: number;
        type?: string;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: any[];
            pagination: {
                totalItems: number;
                currentPage: number;
                pageSize: number;
                totalPages: number;
            };
        };
    }>;
    restore(type: string, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    permanentDelete(type: string, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    emptyTrash(type: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStats(): Promise<{
        success: boolean;
        data: Record<string, number>;
    }>;
}
