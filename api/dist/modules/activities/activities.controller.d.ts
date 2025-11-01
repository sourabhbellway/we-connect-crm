import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesController {
    private readonly service;
    constructor(service: ActivitiesService);
    list(page?: string, limit?: string, type?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    create(dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            activity: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            };
        };
    }>;
}
