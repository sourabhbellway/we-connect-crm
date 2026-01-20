export declare enum WorkflowTrigger {
    LEAD_CREATED = "LEAD_CREATED",
    LEAD_UPDATED = "LEAD_UPDATED",
    LEAD_STATUS_CHANGED = "LEAD_STATUS_CHANGED",
    LEAD_ASSIGNED = "LEAD_ASSIGNED",
    DEAL_CREATED = "DEAL_CREATED",
    DEAL_UPDATED = "DEAL_UPDATED",
    DEAL_STAGE_CHANGED = "DEAL_STAGE_CHANGED",
    TASK_CREATED = "TASK_CREATED",
    TASK_COMPLETED = "TASK_COMPLETED"
}
export declare enum ConditionOperator {
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
    IS_EMPTY = "IS_EMPTY",
    IS_NOT_EMPTY = "IS_NOT_EMPTY"
}
export declare enum ConditionLogic {
    AND = "AND",
    OR = "OR"
}
export declare enum ActionType {
    ASSIGN_TO_USER = "ASSIGN_TO_USER",
    ASSIGN_TO_TEAM = "ASSIGN_TO_TEAM",
    CHANGE_STATUS = "CHANGE_STATUS",
    SEND_EMAIL = "SEND_EMAIL",
    SEND_WHATSAPP = "SEND_WHATSAPP",
    CREATE_TASK = "CREATE_TASK",
    ADD_TAG = "ADD_TAG",
    REMOVE_TAG = "REMOVE_TAG",
    UPDATE_FIELD = "UPDATE_FIELD",
    SEND_WEBHOOK = "SEND_WEBHOOK"
}
export declare class WorkflowConditionDto {
    field: string;
    operator: ConditionOperator;
    value?: any;
}
export declare class WorkflowConditionGroupDto {
    logic: ConditionLogic;
    conditions: WorkflowConditionDto[];
}
export declare class WorkflowActionDto {
    type: ActionType;
    config: Record<string, any>;
}
export declare class CreateWorkflowDto {
    name: string;
    description?: string;
    isActive?: boolean;
    trigger: WorkflowTrigger;
    triggerData?: Record<string, any>;
    conditions: WorkflowConditionGroupDto;
    actions: WorkflowActionDto[];
}
