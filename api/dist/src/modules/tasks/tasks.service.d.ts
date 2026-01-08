import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TasksService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    list({ page, limit, status, search, leadId, dealId, assignedTo, }: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        leadId?: number;
        dealId?: number;
        assignedTo?: number;
    }, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            task: {
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    create(dto: CreateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    update(id: number, dto: UpdateTaskDto): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    complete(id: number): Promise<{
        success: boolean;
        data: {
            task: {
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    phone: string | null;
                    company: string | null;
                } | null;
                assignedUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                } | null;
                createdByUser: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
