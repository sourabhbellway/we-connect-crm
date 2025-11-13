import { PrismaService } from '../../database/prisma.service';
import { CreateWorkflowDto, WorkflowTrigger } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { Prisma } from '@prisma/client';
export declare class AutomationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createWorkflowDto: CreateWorkflowDto, userId?: number): Promise<{
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
    }>;
    findAll(includeInactive?: boolean): Promise<({
        _count: {
            executions: number;
        };
    } & {
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
    })[]>;
    findOne(id: number): Promise<{
        executions: {
            error: string | null;
            id: number;
            result: Prisma.JsonValue | null;
            status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
            triggerData: Prisma.JsonValue;
            startedAt: Date;
            completedAt: Date | null;
            duration: number | null;
            workflowId: number;
        }[];
    } & {
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
    }>;
    update(id: number, updateWorkflowDto: UpdateWorkflowDto): Promise<{
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
    }>;
    toggleActive(id: number, isActive: boolean): Promise<{
        name: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        conditions: Prisma.JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: Prisma.JsonValue | null;
        actions: Prisma.JsonValue;
        createdBy: number | null;
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
    private changeStatus;
    private addTag;
    private createTask;
    private sendEmail;
    private updateField;
    getExecutionHistory(workflowId?: number, limit?: number): Promise<({
        workflow: {
            name: string;
            id: number;
            trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        };
    } & {
        error: string | null;
        id: number;
        result: Prisma.JsonValue | null;
        status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
        triggerData: Prisma.JsonValue;
        startedAt: Date;
        completedAt: Date | null;
        duration: number | null;
        workflowId: number;
    })[]>;
}
