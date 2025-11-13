import apiClient from './apiClient';

export enum WorkflowTrigger {
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  LEAD_STATUS_CHANGED = 'LEAD_STATUS_CHANGED',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_UPDATED = 'DEAL_UPDATED',
  DEAL_STAGE_CHANGED = 'DEAL_STAGE_CHANGED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
}

export enum ConditionLogic {
  AND = 'AND',
  OR = 'OR',
}

export enum ActionType {
  ASSIGN_TO_USER = 'ASSIGN_TO_USER',
  ASSIGN_TO_TEAM = 'ASSIGN_TO_TEAM',
  CHANGE_STATUS = 'CHANGE_STATUS',
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_WHATSAPP = 'SEND_WHATSAPP',
  CREATE_TASK = 'CREATE_TASK',
  ADD_TAG = 'ADD_TAG',
  REMOVE_TAG = 'REMOVE_TAG',
  UPDATE_FIELD = 'UPDATE_FIELD',
  SEND_WEBHOOK = 'SEND_WEBHOOK',
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value?: any;
}

export interface WorkflowConditionGroup {
  logic: ConditionLogic;
  conditions: WorkflowCondition[];
}

export interface WorkflowAction {
  type: ActionType;
  config: Record<string, any>;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  triggerData?: Record<string, any>;
  conditions: WorkflowConditionGroup;
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    executions: number;
  };
}

export interface WorkflowExecution {
  id: number;
  workflowId: number;
  workflow: {
    id: number;
    name: string;
    trigger: WorkflowTrigger;
  };
  triggerData: any;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  result?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  trigger: WorkflowTrigger;
  triggerData?: Record<string, any>;
  conditions: WorkflowConditionGroup;
  actions: WorkflowAction[];
}

export const automationService = {
  // Workflows
  async getWorkflows(includeInactive = false): Promise<Workflow[]> {
    const response = await apiClient.get(`/automation/workflows?includeInactive=${includeInactive}`);
    return response.data;
  },

  async getWorkflow(id: number): Promise<Workflow> {
    const response = await apiClient.get(`/automation/workflows/${id}`);
    return response.data;
  },

  async createWorkflow(payload: CreateWorkflowPayload): Promise<Workflow> {
    const response = await apiClient.post('/automation/workflows', payload);
    return response.data;
  },

  async updateWorkflow(id: number, payload: Partial<CreateWorkflowPayload>): Promise<Workflow> {
    const response = await apiClient.patch(`/automation/workflows/${id}`, payload);
    return response.data;
  },

  async deleteWorkflow(id: number): Promise<void> {
    await apiClient.delete(`/automation/workflows/${id}`);
  },

  async toggleWorkflow(id: number, isActive: boolean): Promise<Workflow> {
    const response = await apiClient.patch(`/automation/workflows/${id}/toggle`, { isActive });
    return response.data;
  },

  async executeWorkflow(id: number, triggerData: any): Promise<any> {
    const response = await apiClient.post(`/automation/workflows/${id}/execute`, triggerData);
    return response.data;
  },

  // Execution History
  async getExecutionHistory(workflowId?: number, limit = 50): Promise<WorkflowExecution[]> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/automation/executions?${params.toString()}`);
    return response.data;
  },
};
