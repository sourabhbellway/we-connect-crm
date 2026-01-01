import { PrismaService } from '../../database/prisma.service';
import { CreateWorkflowDto, WorkflowTrigger } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AutomationService {
    private prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(createWorkflowDto: CreateWorkflowDto, userId?: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    }>;
    findAll(includeInactive?: boolean): Promise<({
        _count: {
            executions: number;
        };
    } & {
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    })[]>;
    findOne(id: number): Promise<{
        executions: {
            error: string | null;
            id: number;
            result: Prisma.JsonValue | null;
            status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
            duration: number | null;
            completedAt: Date | null;
            triggerData: Prisma.JsonValue;
            startedAt: Date;
            workflowId: number;
        }[];
    } & {
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    }>;
    update(id: number, updateWorkflowDto: UpdateWorkflowDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    }>;
    remove(id: number): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    }>;
    toggleActive(id: number, isActive: boolean): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
    }>;
    executeWorkflowsForTrigger(trigger: WorkflowTrigger, triggerData: any): Promise<PromiseSettledResult<{
        success: boolean;
        reason: string;
        actionResults?: undefined;
    } | {
        success: boolean;
        actionResults: ({
            action: any;
            success: boolean;
            result: {
                error: string;
                assigned?: undefined;
                userId?: undefined;
            } | {
                assigned: boolean;
                userId: any;
                error?: undefined;
            } | {
                error: string;
                assigned?: undefined;
                teamId?: undefined;
                assignedTo?: undefined;
            } | {
                assigned: boolean;
                teamId: any;
                assignedTo: number;
                error?: undefined;
            } | {
                error: string;
                statusChanged?: undefined;
                newStatus?: undefined;
            } | {
                statusChanged: boolean;
                newStatus: any;
                error?: undefined;
            } | {
                error: string;
                tagAdded?: undefined;
                tagId?: undefined;
            } | {
                tagAdded: boolean;
                tagId: any;
                error?: undefined;
            } | {
                taskCreated: boolean;
                taskId: number;
            } | {
                emailSent: boolean;
                to: any;
            } | {
                error: string;
                fieldUpdated?: undefined;
                field?: undefined;
            } | {
                fieldUpdated: boolean;
                field: any;
                error?: undefined;
            } | {
                message: string;
            };
            error?: undefined;
        } | {
            action: any;
            success: boolean;
            error: any;
            result?: undefined;
        })[];
        reason?: undefined;
    }>[]>;
    executeWorkflow(workflowId: number, triggerData: any): Promise<{
        success: boolean;
        reason: string;
        actionResults?: undefined;
    } | {
        success: boolean;
        actionResults: ({
            action: any;
            success: boolean;
            result: {
                error: string;
                assigned?: undefined;
                userId?: undefined;
            } | {
                assigned: boolean;
                userId: any;
                error?: undefined;
            } | {
                error: string;
                assigned?: undefined;
                teamId?: undefined;
                assignedTo?: undefined;
            } | {
                assigned: boolean;
                teamId: any;
                assignedTo: number;
                error?: undefined;
            } | {
                error: string;
                statusChanged?: undefined;
                newStatus?: undefined;
            } | {
                statusChanged: boolean;
                newStatus: any;
                error?: undefined;
            } | {
                error: string;
                tagAdded?: undefined;
                tagId?: undefined;
            } | {
                tagAdded: boolean;
                tagId: any;
                error?: undefined;
            } | {
                taskCreated: boolean;
                taskId: number;
            } | {
                emailSent: boolean;
                to: any;
            } | {
                error: string;
                fieldUpdated?: undefined;
                field?: undefined;
            } | {
                fieldUpdated: boolean;
                field: any;
                error?: undefined;
            } | {
                message: string;
            };
            error?: undefined;
        } | {
            action: any;
            success: boolean;
            error: any;
            result?: undefined;
        })[];
        reason?: undefined;
    }>;
    private evaluateConditions;
    private evaluateCondition;
    private getNestedValue;
    private executeActions;
    private executeAction;
    private assignToUser;
    private assignToTeam;
    private changeStatus;
    private addTag;
    private createTask;
    private sendEmail;
    private updateField;
    getExecutionHistory(workflowId?: number, limit?: number): Promise<({
        workflow: {
            id: number;
            name: string;
            trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        };
    } & {
        error: string | null;
        id: number;
        result: Prisma.JsonValue | null;
        status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
        duration: number | null;
        completedAt: Date | null;
        triggerData: Prisma.JsonValue;
        startedAt: Date;
        workflowId: number;
    })[]>;
}
