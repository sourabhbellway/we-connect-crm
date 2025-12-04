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

export interface FieldOption {
  value: string;
  label: string;
  category: string;
}

export interface TriggerFieldMapping {
  [trigger: string]: FieldOption[];
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

// Enhanced field mappings for better automation
export const TRIGGER_FIELD_MAPPING: TriggerFieldMapping = {
  [WorkflowTrigger.LEAD_CREATED]: [
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'status', label: 'Status', category: 'Lead Info' },
    { value: 'city', label: 'City', category: 'Lead Info' },
    { value: 'budget', label: 'Budget', category: 'Lead Info' },
    { value: 'email', label: 'Email', category: 'Contact' },
    { value: 'phone', label: 'Phone', category: 'Contact' },
    { value: 'company', label: 'Company', category: 'Contact' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
    { value: 'createdAt', label: 'Created Date', category: 'System' },
  ],
  [WorkflowTrigger.LEAD_UPDATED]: [
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'status', label: 'Status', category: 'Lead Info' },
    { value: 'city', label: 'City', category: 'Lead Info' },
    { value: 'budget', label: 'Budget', category: 'Lead Info' },
    { value: 'email', label: 'Email', category: 'Contact' },
    { value: 'phone', label: 'Phone', category: 'Contact' },
    { value: 'company', label: 'Company', category: 'Contact' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
    { value: 'updatedAt', label: 'Updated Date', category: 'System' },
  ],
  [WorkflowTrigger.LEAD_STATUS_CHANGED]: [
    { value: 'status', label: 'New Status', category: 'Lead Info' },
    { value: 'previousStatus', label: 'Previous Status', category: 'Lead Info' },
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'city', label: 'City', category: 'Lead Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
  ],
  [WorkflowTrigger.LEAD_ASSIGNED]: [
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
    { value: 'previousAssignee', label: 'Previous Assignee', category: 'Assignment' },
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'status', label: 'Status', category: 'Lead Info' },
    { value: 'city', label: 'City', category: 'Lead Info' },
  ],
  [WorkflowTrigger.DEAL_CREATED]: [
    { value: 'title', label: 'Deal Title', category: 'Deal Info' },
    { value: 'stage', label: 'Stage', category: 'Deal Info' },
    { value: 'value', label: 'Deal Value', category: 'Deal Info' },
    { value: 'probability', label: 'Probability (%)', category: 'Deal Info' },
    { value: 'expectedCloseDate', label: 'Expected Close Date', category: 'Deal Info' },
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
  ],
  [WorkflowTrigger.DEAL_UPDATED]: [
    { value: 'title', label: 'Deal Title', category: 'Deal Info' },
    { value: 'stage', label: 'Stage', category: 'Deal Info' },
    { value: 'value', label: 'Deal Value', category: 'Deal Info' },
    { value: 'probability', label: 'Probability (%)', category: 'Deal Info' },
    { value: 'expectedCloseDate', label: 'Expected Close Date', category: 'Deal Info' },
    { value: 'source', label: 'Source', category: 'Lead Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
    { value: 'updatedAt', label: 'Updated Date', category: 'System' },
  ],
  [WorkflowTrigger.DEAL_STAGE_CHANGED]: [
    { value: 'stage', label: 'New Stage', category: 'Deal Info' },
    { value: 'previousStage', label: 'Previous Stage', category: 'Deal Info' },
    { value: 'value', label: 'Deal Value', category: 'Deal Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
  ],
  [WorkflowTrigger.TASK_CREATED]: [
    { value: 'title', label: 'Task Title', category: 'Task Info' },
    { value: 'status', label: 'Status', category: 'Task Info' },
    { value: 'priority', label: 'Priority', category: 'Task Info' },
    { value: 'dueDate', label: 'Due Date', category: 'Task Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
    { value: 'createdAt', label: 'Created Date', category: 'System' },
  ],
  [WorkflowTrigger.TASK_COMPLETED]: [
    { value: 'status', label: 'Status', category: 'Task Info' },
    { value: 'completedAt', label: 'Completed Date', category: 'Task Info' },
    { value: 'priority', label: 'Priority', category: 'Task Info' },
    { value: 'assignedTo', label: 'Assigned To', category: 'Assignment' },
  ],
};

// Utility functions for field management
export const getFieldsForTrigger = (trigger: WorkflowTrigger): FieldOption[] => {
  return TRIGGER_FIELD_MAPPING[trigger] || [];
};

export const getGroupedFieldsForTrigger = (trigger: WorkflowTrigger): Record<string, FieldOption[]> => {
  const fields = getFieldsForTrigger(trigger);
  return fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldOption[]>);
};

export const getDefaultCondition = (trigger: WorkflowTrigger): WorkflowCondition => {
  switch (trigger) {
    case WorkflowTrigger.LEAD_CREATED:
    case WorkflowTrigger.LEAD_UPDATED:
      return { field: 'source', operator: ConditionOperator.EQUALS, value: '' };
    case WorkflowTrigger.DEAL_CREATED:
    case WorkflowTrigger.DEAL_UPDATED:
      return { field: 'stage', operator: ConditionOperator.EQUALS, value: '' };
    case WorkflowTrigger.TASK_CREATED:
      return { field: 'priority', operator: ConditionOperator.EQUALS, value: '' };
    case WorkflowTrigger.LEAD_STATUS_CHANGED:
      return { field: 'status', operator: ConditionOperator.EQUALS, value: '' };
    default:
      return { field: 'status', operator: ConditionOperator.EQUALS, value: '' };
  }
};

export const validateWorkflowPayload = (payload: CreateWorkflowPayload): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!payload.name?.trim()) {
    errors.push('Workflow name is required');
  }

  if (!payload.trigger) {
    errors.push('Trigger is required');
  }

  if (!payload.conditions?.conditions?.length) {
    errors.push('At least one condition is required');
  }

  if (!payload.actions?.length) {
    errors.push('At least one action is required');
  }

  // Validate that all condition fields are valid for the trigger
  if (payload.conditions?.conditions && payload.trigger) {
    const availableFields = getFieldsForTrigger(payload.trigger).map(f => f.value);
    payload.conditions.conditions.forEach((condition, index) => {
      if (!availableFields.includes(condition.field)) {
        errors.push(`Condition ${index + 1}: Field "${condition.field}" is not available for trigger "${payload.trigger}"`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

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
    // Validate payload before sending
    const validation = validateWorkflowPayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const response = await apiClient.post('/automation/workflows', payload);
    return response.data;
  },

  async updateWorkflow(id: number, payload: Partial<CreateWorkflowPayload>): Promise<Workflow> {
    // Validate payload before sending if it's a complete update
    if (payload.name || payload.trigger || payload.conditions || payload.actions) {
      const validation = validateWorkflowPayload(payload as CreateWorkflowPayload);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

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

  // Field utilities
  getFieldsForTrigger,
  getGroupedFieldsForTrigger,
  getDefaultCondition,
  validateWorkflowPayload,
};
