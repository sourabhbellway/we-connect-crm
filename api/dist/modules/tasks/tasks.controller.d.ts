import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly service;
    constructor(service: TasksService);
    list(page?: string, limit?: string, status?: string, search?: string, leadId?: string, dealId?: string, contactId?: string, entityType?: 'lead' | 'deal' | 'contact' | 'company', entityId?: string, assignedTo?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            })[];
            tasks: ({
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            })[];
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
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            };
        };
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            };
        };
    }>;
    complete(id: string): Promise<{
        success: boolean;
        data: {
            task: {
                assignedUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                createdByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                assignedTo: number | null;
                contactId: number | null;
                leadId: number | null;
                dueDate: Date | null;
                completedAt: Date | null;
                createdBy: number;
                dealId: number | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
