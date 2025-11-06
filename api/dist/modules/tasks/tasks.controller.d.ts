import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly service;
    constructor(service: TasksService);
    list(page?: string, limit?: string, status?: string, search?: string, leadId?: string, dealId?: string, entityType?: 'lead' | 'deal' | 'company', entityId?: string, assignedTo?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
            })[];
            tasks: ({
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
                dealId: number | null;
                createdBy: number;
                dueDate: Date | null;
                completedAt: Date | null;
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
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
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
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
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
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
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
                lead: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    phone: string | null;
                    company: string | null;
                } | null;
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
                leadId: number | null;
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
