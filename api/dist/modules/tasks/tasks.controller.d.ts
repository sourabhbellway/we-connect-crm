import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly service;
    constructor(service: TasksService);
    list(page?: string, limit?: string, status?: string, search?: string, leadId?: string, dealId?: string, contactId?: string): Promise<{
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
    get(id: string): Promise<{
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
    update(id: string, dto: UpdateTaskDto): Promise<{
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
    complete(id: string): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
