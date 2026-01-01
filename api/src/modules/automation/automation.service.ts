import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateWorkflowDto,
  WorkflowTrigger,
  ConditionOperator,
  ConditionLogic,
  ActionType,
} from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { Prisma, WorkflowExecutionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
  ) { }

  // CRUD Operations
  async create(createWorkflowDto: CreateWorkflowDto, userId?: number) {
    const workflow = await this.prisma.workflow.create({
      data: {
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
        isActive: createWorkflowDto.isActive ?? true,
        trigger: createWorkflowDto.trigger,
        triggerData: createWorkflowDto.triggerData || {},
        conditions: createWorkflowDto.conditions as any,
        actions: createWorkflowDto.actions as any,
        createdBy: userId,
      },
    });

    // Log Activity
    try {
      await this.activitiesService.create({
        title: `Automation Created: ${workflow.name}`,
        description: `New workflow "${workflow.name}" was created.`,
        type: 'AUTOMATION_CREATED' as any,
        userId: userId,
        icon: 'FiPlus',
        iconColor: 'text-green-600',
        metadata: { workflowId: workflow.id } as any,
      });
    } catch (error) {
      this.logger.error('Failed to log automation creation activity:', error);
    }

    return workflow;
  }

  async findAll(includeInactive = false) {
    const where: Prisma.WorkflowWhereInput = {
      deletedAt: null,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.workflow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { executions: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, deletedAt: null },
      include: {
        executions: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async update(id: number, updateWorkflowDto: UpdateWorkflowDto) {
    const workflow = await this.findOne(id);

    const updatedWorkflow = await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        name: updateWorkflowDto.name,
        description: updateWorkflowDto.description,
        isActive: updateWorkflowDto.isActive,
        trigger: updateWorkflowDto.trigger,
        triggerData: updateWorkflowDto.triggerData as any,
        conditions: updateWorkflowDto.conditions as any,
        actions: updateWorkflowDto.actions as any,
      },
    });

    // Log Activity
    try {
      await this.activitiesService.create({
        title: `Automation Updated: ${updatedWorkflow.name}`,
        description: `Workflow "${updatedWorkflow.name}" was updated.`,
        type: 'AUTOMATION_UPDATED' as any,
        userId: updatedWorkflow.createdBy ?? undefined, // Use updated value
        icon: 'FiEdit',
        iconColor: 'text-blue-600',
        metadata: { workflowId: updatedWorkflow.id } as any,
      });
    } catch (error) {
      this.logger.error('Failed to log automation update activity:', error);
    }

    return updatedWorkflow;
  }

  async remove(id: number) {
    const workflow = await this.findOne(id);

    const deletedWorkflow = await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { deletedAt: new Date() },
    });

    // Log Activity
    try {
      await this.activitiesService.create({
        title: `Automation Deleted: ${deletedWorkflow.name}`,
        description: `Workflow "${deletedWorkflow.name}" was deleted.`,
        type: 'AUTOMATION_DELETED' as any,
        userId: deletedWorkflow.createdBy ?? undefined,
        icon: 'FiTrash2',
        iconColor: 'text-red-600',
        metadata: { workflowId: deletedWorkflow.id } as any,
      });
    } catch (error) {
      this.logger.error('Failed to log automation deletion activity:', error);
    }

    return deletedWorkflow;
  }

  async toggleActive(id: number, isActive: boolean) {
    const workflow = await this.findOne(id);

    return this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { isActive },
    });
  }

  // Execution Engine
  async executeWorkflowsForTrigger(
    trigger: WorkflowTrigger,
    triggerData: any,
  ) {
    this.logger.log(`Executing workflows for trigger: ${trigger}`);

    const workflows = await this.prisma.workflow.findMany({
      where: {
        trigger,
        isActive: true,
        deletedAt: null,
      },
    });

    this.logger.log(`Found ${workflows.length} workflows for trigger ${trigger}`);

    const results = await Promise.allSettled(
      workflows.map((workflow: any) =>
        this.executeWorkflow(workflow.id, triggerData),
      ),
    );

    return results;
  }

  async executeWorkflow(workflowId: number, triggerData: any) {
    const startTime = Date.now();
    const workflow = await this.findOne(workflowId);

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        triggerData: triggerData as any,
        status: WorkflowExecutionStatus.RUNNING,
      },
    });

    try {
      this.logger.log(`Executing workflow: ${workflow.name} (ID: ${workflowId})`);

      // Evaluate conditions
      const conditionsPass = this.evaluateConditions(
        workflow.conditions as any,
        triggerData,
      );

      if (!conditionsPass) {
        this.logger.log(`Workflow ${workflowId} conditions not met, skipping`);
        await this.prisma.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: WorkflowExecutionStatus.SKIPPED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            result: { reason: 'Conditions not met' },
          },
        });
        return { success: false, reason: 'Conditions not met' };
      }

      // Execute actions
      const actionResults = await this.executeActions(
        workflow.actions as any,
        triggerData,
      );

      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.SUCCESS,
          completedAt: new Date(),
          duration: Date.now() - startTime,
          result: { actionResults },
        },
      });

      this.logger.log(`Workflow ${workflowId} executed successfully`);

      // Log Activity
      try {
        await this.activitiesService.create({
          title: `Automation Executed: ${workflow.name}`,
          description: `Workflow "${workflow.name}" was triggered and executed successfully.`,
          type: 'AUTOMATION_EXECUTED' as any,
          userId: workflow.createdBy ?? undefined,
          icon: 'FiZap',
          iconColor: 'text-yellow-600',
          metadata: {
            workflowId: workflow.id,
            executionId: execution.id,
            trigger: workflow.trigger,
            actionResults
          } as any,
        });
      } catch (activityError) {
        this.logger.error('Failed to create automation activity:', activityError);
      }

      // Optional: send a SYSTEM notification to the workflow creator if configured
      try {
        if (workflow.createdBy) {
          await this.notificationsService.create({
            userId: workflow.createdBy,
            type: 'SYSTEM' as any,
            title: 'Automation Executed',
            message: `Workflow "${workflow.name}" executed successfully.`,
            metadata: {
              workflowId: workflow.id,
              executionId: execution.id,
              trigger: workflow.trigger,
            } as any,
          });
        }
      } catch (notifyError) {
        this.logger.error('Failed to send automation execution notification:', notifyError);
      }

      return { success: true, actionResults };
    } catch (error) {
      this.logger.error(`Workflow ${workflowId} execution failed:`, error);
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.FAILED,
          completedAt: new Date(),
          duration: Date.now() - startTime,
          error: error.message,
        },
      });

      // Notify workflow creator about failure
      try {
        await this.activitiesService.create({
          title: `Automation Failed: ${workflow.name}`,
          description: `Workflow "${workflow.name}" failed: ${error.message}`,
          type: 'AUTOMATION_FAILED' as any,
          userId: workflow.createdBy ?? undefined,
          icon: 'FiZap',
          iconColor: 'text-red-600',
          metadata: {
            workflowId: workflow.id,
            executionId: execution.id,
            trigger: workflow.trigger,
            error: error.message
          } as any,
        });

        if (workflow.createdBy) {
          await this.notificationsService.create({
            userId: workflow.createdBy,
            type: 'SYSTEM' as any,
            title: 'Automation Failed',
            message: `Workflow "${workflow.name}" failed: ${error.message}`,
            metadata: {
              workflowId: workflow.id,
              executionId: execution.id,
              trigger: workflow.trigger,
            } as any,
          });
        }
      } catch (notifyError) {
        this.logger.error('Failed to send automation failure notification/activity:', notifyError);
      }

      throw error;
    }
  }

  // Condition Evaluation
  private evaluateConditions(conditionGroup: any, data: any): boolean {
    const logic = conditionGroup.logic || ConditionLogic.AND;
    const conditions = conditionGroup.conditions || [];

    if (conditions.length === 0) {
      return true;
    }

    const results = conditions.map((condition: any) =>
      this.evaluateCondition(condition, data),
    );

    if (logic === ConditionLogic.AND) {
      return results.every((r: boolean) => r);
    } else {
      return results.some((r: boolean) => r);
    }
  }

  private evaluateCondition(condition: any, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return fieldValue == conditionValue;
      case ConditionOperator.NOT_EQUALS:
        return fieldValue != conditionValue;
      case ConditionOperator.CONTAINS:
        return String(fieldValue).includes(String(conditionValue));
      case ConditionOperator.NOT_CONTAINS:
        return !String(fieldValue).includes(String(conditionValue));
      case ConditionOperator.GREATER_THAN:
        return Number(fieldValue) > Number(conditionValue);
      case ConditionOperator.LESS_THAN:
        return Number(fieldValue) < Number(conditionValue);
      case ConditionOperator.GREATER_THAN_OR_EQUAL:
        return Number(fieldValue) >= Number(conditionValue);
      case ConditionOperator.LESS_THAN_OR_EQUAL:
        return Number(fieldValue) <= Number(conditionValue);
      case ConditionOperator.IS_EMPTY:
        return !fieldValue || fieldValue === '' || fieldValue === null;
      case ConditionOperator.IS_NOT_EMPTY:
        return !!fieldValue && fieldValue !== '' && fieldValue !== null;
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Action Execution
  private async executeActions(actions: any[], data: any) {
    const results = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, data);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        this.logger.error(`Action ${action.type} failed:`, error);
        results.push({ action: action.type, success: false, error: error.message });
      }
    }

    return results;
  }

  private async executeAction(action: any, data: any) {
    this.logger.log(`Executing action: ${action.type}`);

    switch (action.type) {
      case ActionType.ASSIGN_TO_USER:
        return this.assignToUser(data, action.config);
      case ActionType.ASSIGN_TO_TEAM:
        return this.assignToTeam(data, action.config);
      case ActionType.CHANGE_STATUS:
        return this.changeStatus(data, action.config);
      case ActionType.ADD_TAG:
        return this.addTag(data, action.config);
      case ActionType.CREATE_TASK:
        return this.createTask(data, action.config);
      case ActionType.SEND_EMAIL:
        return this.sendEmail(data, action.config);
      case ActionType.UPDATE_FIELD:
        return this.updateField(data, action.config);
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
        return { message: 'Action type not implemented' };
    }
  }

  // Action Implementations
  private async assignToUser(data: any, config: any) {
    if (!data.id) return { error: 'No entity ID provided' };

    const entityType = data.entityType || 'lead';
    const userId = config.userId;

    if (entityType === 'lead') {
      await this.prisma.lead.update({
        where: { id: data.id },
        data: { assignedTo: userId },
      });
    }

    return { assigned: true, userId };
  }

  private async assignToTeam(data: any, config: any) {
    if (!data.id) return { error: 'No entity ID provided' };
    if (!config.teamId) return { error: 'No team ID provided' };

    const team = await this.prisma.team.findUnique({
      where: { id: config.teamId },
      select: { managerId: true },
    });

    if (!team || !team.managerId) {
      return { error: 'Team manager not found' };
    }

    const entityType = data.entityType || 'lead';
    const managerId = team.managerId;

    if (entityType === 'lead') {
      await this.prisma.lead.update({
        where: { id: data.id },
        data: { assignedTo: managerId },
      });
    } else if (entityType === 'deal') {
      await this.prisma.deal.update({
        where: { id: data.id },
        data: { assignedTo: managerId },
      });
    }

    return { assigned: true, teamId: config.teamId, assignedTo: managerId };
  }

  private async changeStatus(data: any, config: any) {
    if (!data.id) return { error: 'No entity ID provided' };

    await this.prisma.lead.update({
      where: { id: data.id },
      data: { status: config.status },
    });

    return { statusChanged: true, newStatus: config.status };
  }

  private async addTag(data: any, config: any) {
    if (!data.id) return { error: 'No entity ID provided' };

    await this.prisma.leadTag.create({
      data: {
        leadId: data.id,
        tagId: config.tagId,
      },
    });

    return { tagAdded: true, tagId: config.tagId };
  }

  private async createTask(data: any, config: any) {
    const task = await this.prisma.task.create({
      data: {
        title: config.title,
        description: config.description,
        status: 'PENDING',
        priority: config.priority || 'MEDIUM',
        leadId: data.id,
        assignedTo: config.assignedTo,
        createdBy: config.createdBy,
        dueDate: config.dueDate,
      },
    });

    return { taskCreated: true, taskId: task.id };
  }

  private async sendEmail(data: any, config: any) {
    // Placeholder for email sending
    this.logger.log(`Sending email to ${data.email || config.to}`);
    return { emailSent: true, to: data.email || config.to };
  }

  private async updateField(data: any, config: any) {
    if (!data.id) return { error: 'No entity ID provided' };

    const updateData: any = {};
    updateData[config.fieldName] = config.fieldValue;

    await this.prisma.lead.update({
      where: { id: data.id },
      data: updateData,
    });

    return { fieldUpdated: true, field: config.fieldName };
  }

  // Execution History
  async getExecutionHistory(workflowId?: number, limit = 50) {
    const where: Prisma.WorkflowExecutionWhereInput = {};

    if (workflowId) {
      where.workflowId = workflowId;
    }

    return this.prisma.workflowExecution.findMany({
      where,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            trigger: true,
          },
        },
      },
    });
  }
}
