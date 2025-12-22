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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
                entityType: string;
                entityId: number;
                uploadedBy: number;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
            }[];
            items: {
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                name: string;
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
