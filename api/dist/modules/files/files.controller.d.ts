import { FilesService } from './files.service';
export declare class FilesController {
    private readonly service;
    constructor(service: FilesService);
    list(entityType?: string, entityId?: string): Promise<{
        success: boolean;
        data: {
            files: {
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
    upload(file: any, entityType: string, entityId: string, req: any, name?: string): Promise<{
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
    download(id: string, res: any, disposition?: 'inline' | 'attachment'): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
