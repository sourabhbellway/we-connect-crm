import { AutomationService } from './automation.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
export declare class AutomationController {
    private readonly automationService;
    constructor(automationService: AutomationService);
    create(createWorkflowDto: CreateWorkflowDto, req: any): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(includeInactive?: string): Promise<({
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
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findOne(id: string): Promise<{
        executions: {
            error: string | null;
            id: number;
            result: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
            duration: number | null;
            completedAt: Date | null;
            triggerData: import("@prisma/client/runtime/library").JsonValue;
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
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(id: string): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    toggleActive(id: string, isActive: boolean): Promise<{
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        id: number;
        name: string;
        description: string | null;
        createdBy: number | null;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        triggerData: import("@prisma/client/runtime/library").JsonValue | null;
        actions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    executeWorkflow(id: string, triggerData: any): Promise<{
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
    getExecutionHistory(workflowId?: string, limit?: string): Promise<({
        workflow: {
            id: number;
            name: string;
            trigger: import("@prisma/client").$Enums.WorkflowTrigger;
        };
    } & {
        error: string | null;
        id: number;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.WorkflowExecutionStatus;
        duration: number | null;
        completedAt: Date | null;
        triggerData: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        workflowId: number;
    })[]>;
}
