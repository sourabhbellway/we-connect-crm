import { TrashService } from './trash.service';
export declare class TrashController {
    private readonly trashService;
    constructor(trashService: TrashService);
    getStats(): Promise<{
        success: boolean;
        data: Record<string, number>;
    }>;
    findAll(page?: string, limit?: string, type?: string, search?: string): Promise<{
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
    restore(type: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    permanentDelete(type: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    emptyTrash(type: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
