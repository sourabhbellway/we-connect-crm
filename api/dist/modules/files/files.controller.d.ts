import { FilesService } from './files.service';
export declare class FilesController {
    private readonly service;
    constructor(service: FilesService);
    list(entityType?: string, entityId?: string): Promise<{
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
    upload(file: any, entityType: string, entityId: string, uploadedBy: string, name?: string): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
