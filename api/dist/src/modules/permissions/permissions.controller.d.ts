import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly service;
    constructor(service: PermissionsService);
    list(): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            description: string | null;
            key: string;
            module: string;
        }[];
    }>;
}
