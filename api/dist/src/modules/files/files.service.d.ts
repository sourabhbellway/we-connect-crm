import { PrismaService } from '../../database/prisma.service';
export declare class FilesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ entityType, entityId, }: {
        entityType?: string;
        entityId?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            files: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                deletedAt: Date | null;
                entityType: string;
                entityId: number;
                uploadedBy: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
            }[];
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                deletedAt: Date | null;
                entityType: string;
                entityId: number;
                uploadedBy: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
            }[];
        };
    }>;
    getById(id: number, user?: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        deletedAt: Date | null;
        entityType: string;
        entityId: number;
        uploadedBy: number;
        fileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
    } | null>;
    upload({ file, entityType, entityId, uploadedBy, name, }: {
        file: any;
        entityType: string;
        entityId: number;
        uploadedBy: number;
        name?: string;
    }): Promise<{
        success: boolean;
        data: {
            file: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                deletedAt: Date | null;
                entityType: string;
                entityId: number;
                uploadedBy: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
