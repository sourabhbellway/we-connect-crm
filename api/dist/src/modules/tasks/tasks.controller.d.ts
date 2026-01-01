import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly service;
    constructor(service: TasksService);
    list(page?: string, limit?: string, status?: string, search?: string, leadId?: string, dealId?: string, entityType?: 'lead' | 'deal' | 'company', entityId?: string, assignedTo?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            })[];
            tasks: ({
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            task: {
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateTaskDto, user?: any): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            };
        };
    }>;
    update(id: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            };
        };
    }>;
    complete(id: string): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                title: string;
                leadId: number | null;
                assignedTo: number | null;
                createdBy: number;
                status: import("@prisma/client").$Enums.TaskStatus;
                priority: import("@prisma/client").$Enums.TaskPriority;
                completedAt: Date | null;
                dueDate: Date | null;
                dealId: number | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
