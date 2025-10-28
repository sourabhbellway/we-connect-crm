import { PrismaService } from '../../database/prisma.service';
export declare class FilesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ entityType, entityId }: {
        entityType?: string;
        entityId?: number;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                entityType: string;
                entityId: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
                uploadedBy: number;
            }[];
        };
    }>;
    upload({ file, entityType, entityId, uploadedBy, name }: {
        file: any;
        entityType: string;
        entityId: number;
        uploadedBy: number;
        name?: string;
    }): Promise<{
        success: boolean;
        data: {
            file: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                entityType: string;
                entityId: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
                uploadedBy: number;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
