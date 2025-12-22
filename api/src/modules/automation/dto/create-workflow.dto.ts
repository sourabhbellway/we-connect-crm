import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class WorkflowConditionDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsEnum(ConditionOperator)
  operator: ConditionOperator;

  @IsOptional()
  value?: any;
}

export class WorkflowConditionGroupDto {
  @IsEnum(ConditionLogic)
  logic: ConditionLogic;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions: WorkflowConditionDto[];
}

export class WorkflowActionDto {
  @IsEnum(ActionType)
  type: ActionType;

  @IsObject()
  config: Record<string, any>;
}

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(WorkflowTrigger)
  trigger: WorkflowTrigger;

  @IsOptional()
  @IsObject()
  triggerData?: Record<string, any>;

  @IsObject()
  @ValidateNested()
  @Type(() => WorkflowConditionGroupDto)
  conditions: WorkflowConditionGroupDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];
}
