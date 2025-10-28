import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly service;
    constructor(service: PermissionsService);
    list(): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            key: string;
            module: string;
        }[];
    }>;
}
