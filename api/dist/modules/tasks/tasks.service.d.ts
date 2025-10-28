import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, status, search, leadId, dealId, contactId }: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        leadId?: number;
        dealId?: number;
        contactId?: number;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.TaskStatus;
                assignedTo: number | null;
                title: string;
                description: string | null;
                priority: import("@prisma/client").$Enums.TaskPriority;
                leadId: number | null;
                contactId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            task: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.TaskStatus;
                assignedTo: number | null;
                title: string;
                description: string | null;
                priority: import("@prisma/client").$Enums.TaskPriority;
                leadId: number | null;
                contactId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.TaskStatus;
                assignedTo: number | null;
                title: string;
                description: string | null;
                priority: import("@prisma/client").$Enums.TaskPriority;
                leadId: number | null;
                contactId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            };
        };
    }>;
    update(id: number, dto: UpdateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.TaskStatus;
                assignedTo: number | null;
                title: string;
                description: string | null;
                priority: import("@prisma/client").$Enums.TaskPriority;
                leadId: number | null;
                contactId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            };
        };
    }>;
    complete(id: number): Promise<{
        success: boolean;
        data: {
            task: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import("@prisma/client").$Enums.TaskStatus;
                assignedTo: number | null;
                title: string;
                description: string | null;
                priority: import("@prisma/client").$Enums.TaskPriority;
                leadId: number | null;
                contactId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
