import { FilesService } from './files.service';
export declare class FilesController {
    private readonly service;
    constructor(service: FilesService);
    list(entityType?: string, entityId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            files: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    upload(file: any, entityType: string, entityId: string, user: any, name?: string): Promise<{
        success: boolean;
        data: {
            file: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    download(id: string, res: any, disposition?: 'inline' | 'attachment', user?: any): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
