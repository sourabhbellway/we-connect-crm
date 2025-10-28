import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, type }: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                tags: string[];
                title: string;
                description: string;
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
                tags: string[];
                title: string;
                description: string;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            };
        };
    }>;
}
