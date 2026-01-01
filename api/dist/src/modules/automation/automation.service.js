"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const activities_service_1 = require("../activities/activities.service");
let AutomationService = AutomationService_1 = class AutomationService {
    prisma;
    notificationsService;
    activitiesService;
    logger = new common_1.Logger(AutomationService_1.name);
    constructor(prisma, notificationsService, activitiesService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.activitiesService = activitiesService;
    }
    async create(createWorkflowDto, userId) {
        const workflow = await this.prisma.workflow.create({
            data: {
                name: createWorkflowDto.name,
                description: createWorkflowDto.description,
                isActive: createWorkflowDto.isActive ?? true,
                trigger: createWorkflowDto.trigger,
                triggerData: createWorkflowDto.triggerData || {},
                conditions: createWorkflowDto.conditions,
                actions: createWorkflowDto.actions,
                createdBy: userId,
            },
        });
        try {
            await this.activitiesService.create({
                title: `Automation Created: ${workflow.name}`,
                description: `New workflow "${workflow.name}" was created.`,
                type: 'AUTOMATION_CREATED',
                userId: userId,
                icon: 'FiPlus',
                iconColor: 'text-green-600',
                metadata: { workflowId: workflow.id },
            });
        }
        catch (error) {
            this.logger.error('Failed to log automation creation activity:', error);
        }
        return workflow;
    }
    async findAll(includeInactive = false) {
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Workflow with ID ${id} not found`);
        }
        return workflow;
    }
    async update(id, updateWorkflowDto) {
        const workflow = await this.findOne(id);
        const updatedWorkflow = await this.prisma.workflow.update({
            where: { id: workflow.id },
            data: {
                name: updateWorkflowDto.name,
                description: updateWorkflowDto.description,
                isActive: updateWorkflowDto.isActive,
                trigger: updateWorkflowDto.trigger,
                triggerData: updateWorkflowDto.triggerData,
                conditions: updateWorkflowDto.conditions,
                actions: updateWorkflowDto.actions,
            },
        });
        try {
            await this.activitiesService.create({
                title: `Automation Updated: ${updatedWorkflow.name}`,
                description: `Workflow "${updatedWorkflow.name}" was updated.`,
                type: 'AUTOMATION_UPDATED',
                userId: updatedWorkflow.createdBy ?? undefined,
                icon: 'FiEdit',
                iconColor: 'text-blue-600',
                metadata: { workflowId: updatedWorkflow.id },
            });
        }
        catch (error) {
            this.logger.error('Failed to log automation update activity:', error);
        }
        return updatedWorkflow;
    }
    async remove(id) {
        const workflow = await this.findOne(id);
        const deletedWorkflow = await this.prisma.workflow.update({
            where: { id: workflow.id },
            data: { deletedAt: new Date() },
        });
        try {
            await this.activitiesService.create({
                title: `Automation Deleted: ${deletedWorkflow.name}`,
                description: `Workflow "${deletedWorkflow.name}" was deleted.`,
                type: 'AUTOMATION_DELETED',
                userId: deletedWorkflow.createdBy ?? undefined,
                icon: 'FiTrash2',
                iconColor: 'text-red-600',
                metadata: { workflowId: deletedWorkflow.id },
            });
        }
        catch (error) {
            this.logger.error('Failed to log automation deletion activity:', error);
        }
        return deletedWorkflow;
    }
    async toggleActive(id, isActive) {
        const workflow = await this.findOne(id);
        return this.prisma.workflow.update({
            where: { id: workflow.id },
            data: { isActive },
        });
    }
    async executeWorkflowsForTrigger(trigger, triggerData) {
        this.logger.log(`Executing workflows for trigger: ${trigger}`);
        const workflows = await this.prisma.workflow.findMany({
            where: {
                trigger,
                isActive: true,
                deletedAt: null,
            },
        });
        this.logger.log(`Found ${workflows.length} workflows for trigger ${trigger}`);
        const results = await Promise.allSettled(workflows.map((workflow) => this.executeWorkflow(workflow.id, triggerData)));
        return results;
    }
    async executeWorkflow(workflowId, triggerData) {
        const startTime = Date.now();
        const workflow = await this.findOne(workflowId);
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId,
                triggerData: triggerData,
                status: client_1.WorkflowExecutionStatus.RUNNING,
            },
        });
        try {
            this.logger.log(`Executing workflow: ${workflow.name} (ID: ${workflowId})`);
            const conditionsPass = this.evaluateConditions(workflow.conditions, triggerData);
            if (!conditionsPass) {
                this.logger.log(`Workflow ${workflowId} conditions not met, skipping`);
                await this.prisma.workflowExecution.update({
                    where: { id: execution.id },
                    data: {
                        status: client_1.WorkflowExecutionStatus.SKIPPED,
                        completedAt: new Date(),
                        duration: Date.now() - startTime,
                        result: { reason: 'Conditions not met' },
                    },
                });
                return { success: false, reason: 'Conditions not met' };
            }
            const actionResults = await this.executeActions(workflow.actions, triggerData);
            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: client_1.WorkflowExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    duration: Date.now() - startTime,
                    result: { actionResults },
                },
            });
            this.logger.log(`Workflow ${workflowId} executed successfully`);
            try {
                await this.activitiesService.create({
                    title: `Automation Executed: ${workflow.name}`,
                    description: `Workflow "${workflow.name}" was triggered and executed successfully.`,
                    type: 'AUTOMATION_EXECUTED',
                    userId: workflow.createdBy ?? undefined,
                    icon: 'FiZap',
                    iconColor: 'text-yellow-600',
                    metadata: {
                        workflowId: workflow.id,
                        executionId: execution.id,
                        trigger: workflow.trigger,
                        actionResults
                    },
                });
            }
            catch (activityError) {
                this.logger.error('Failed to create automation activity:', activityError);
            }
            try {
                if (workflow.createdBy) {
                    await this.notificationsService.create({
                        userId: workflow.createdBy,
                        type: 'SYSTEM',
                        title: 'Automation Executed',
                        message: `Workflow "${workflow.name}" executed successfully.`,
                        metadata: {
                            workflowId: workflow.id,
                            executionId: execution.id,
                            trigger: workflow.trigger,
                        },
                    });
                }
            }
            catch (notifyError) {
                this.logger.error('Failed to send automation execution notification:', notifyError);
            }
            return { success: true, actionResults };
        }
        catch (error) {
            this.logger.error(`Workflow ${workflowId} execution failed:`, error);
            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: client_1.WorkflowExecutionStatus.FAILED,
                    completedAt: new Date(),
                    duration: Date.now() - startTime,
                    error: error.message,
                },
            });
            try {
                await this.activitiesService.create({
                    title: `Automation Failed: ${workflow.name}`,
                    description: `Workflow "${workflow.name}" failed: ${error.message}`,
                    type: 'AUTOMATION_FAILED',
                    userId: workflow.createdBy ?? undefined,
                    icon: 'FiZap',
                    iconColor: 'text-red-600',
                    metadata: {
                        workflowId: workflow.id,
                        executionId: execution.id,
                        trigger: workflow.trigger,
                        error: error.message
                    },
                });
                if (workflow.createdBy) {
                    await this.notificationsService.create({
                        userId: workflow.createdBy,
                        type: 'SYSTEM',
                        title: 'Automation Failed',
                        message: `Workflow "${workflow.name}" failed: ${error.message}`,
                        metadata: {
                            workflowId: workflow.id,
                            executionId: execution.id,
                            trigger: workflow.trigger,
                        },
                    });
                }
            }
            catch (notifyError) {
                this.logger.error('Failed to send automation failure notification/activity:', notifyError);
            }
            throw error;
        }
    }
    evaluateConditions(conditionGroup, data) {
        const logic = conditionGroup.logic || create_workflow_dto_1.ConditionLogic.AND;
        const conditions = conditionGroup.conditions || [];
        if (conditions.length === 0) {
            return true;
        }
        const results = conditions.map((condition) => this.evaluateCondition(condition, data));
        if (logic === create_workflow_dto_1.ConditionLogic.AND) {
            return results.every((r) => r);
        }
        else {
            return results.some((r) => r);
        }
    }
    evaluateCondition(condition, data) {
        const fieldValue = this.getNestedValue(data, condition.field);
        const conditionValue = condition.value;
        switch (condition.operator) {
            case create_workflow_dto_1.ConditionOperator.EQUALS:
                return fieldValue == conditionValue;
            case create_workflow_dto_1.ConditionOperator.NOT_EQUALS:
                return fieldValue != conditionValue;
            case create_workflow_dto_1.ConditionOperator.CONTAINS:
                return String(fieldValue).includes(String(conditionValue));
            case create_workflow_dto_1.ConditionOperator.NOT_CONTAINS:
                return !String(fieldValue).includes(String(conditionValue));
            case create_workflow_dto_1.ConditionOperator.GREATER_THAN:
                return Number(fieldValue) > Number(conditionValue);
            case create_workflow_dto_1.ConditionOperator.LESS_THAN:
                return Number(fieldValue) < Number(conditionValue);
            case create_workflow_dto_1.ConditionOperator.GREATER_THAN_OR_EQUAL:
                return Number(fieldValue) >= Number(conditionValue);
            case create_workflow_dto_1.ConditionOperator.LESS_THAN_OR_EQUAL:
                return Number(fieldValue) <= Number(conditionValue);
            case create_workflow_dto_1.ConditionOperator.IS_EMPTY:
                return !fieldValue || fieldValue === '' || fieldValue === null;
            case create_workflow_dto_1.ConditionOperator.IS_NOT_EMPTY:
                return !!fieldValue && fieldValue !== '' && fieldValue !== null;
            default:
                return false;
        }
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    async executeActions(actions, data) {
        const results = [];
        for (const action of actions) {
            try {
                const result = await this.executeAction(action, data);
                results.push({ action: action.type, success: true, result });
            }
            catch (error) {
                this.logger.error(`Action ${action.type} failed:`, error);
                results.push({ action: action.type, success: false, error: error.message });
            }
        }
        return results;
    }
    async executeAction(action, data) {
        this.logger.log(`Executing action: ${action.type}`);
        switch (action.type) {
            case create_workflow_dto_1.ActionType.ASSIGN_TO_USER:
                return this.assignToUser(data, action.config);
            case create_workflow_dto_1.ActionType.ASSIGN_TO_TEAM:
                return this.assignToTeam(data, action.config);
            case create_workflow_dto_1.ActionType.CHANGE_STATUS:
                return this.changeStatus(data, action.config);
            case create_workflow_dto_1.ActionType.ADD_TAG:
                return this.addTag(data, action.config);
            case create_workflow_dto_1.ActionType.CREATE_TASK:
                return this.createTask(data, action.config);
            case create_workflow_dto_1.ActionType.SEND_EMAIL:
                return this.sendEmail(data, action.config);
            case create_workflow_dto_1.ActionType.UPDATE_FIELD:
                return this.updateField(data, action.config);
            default:
                this.logger.warn(`Unknown action type: ${action.type}`);
                return { message: 'Action type not implemented' };
        }
    }
    async assignToUser(data, config) {
        if (!data.id)
            return { error: 'No entity ID provided' };
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
    async assignToTeam(data, config) {
        if (!data.id)
            return { error: 'No entity ID provided' };
        if (!config.teamId)
            return { error: 'No team ID provided' };
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
        }
        else if (entityType === 'deal') {
            await this.prisma.deal.update({
                where: { id: data.id },
                data: { assignedTo: managerId },
            });
        }
        return { assigned: true, teamId: config.teamId, assignedTo: managerId };
    }
    async changeStatus(data, config) {
        if (!data.id)
            return { error: 'No entity ID provided' };
        await this.prisma.lead.update({
            where: { id: data.id },
            data: { status: config.status },
        });
        return { statusChanged: true, newStatus: config.status };
    }
    async addTag(data, config) {
        if (!data.id)
            return { error: 'No entity ID provided' };
        await this.prisma.leadTag.create({
            data: {
                leadId: data.id,
                tagId: config.tagId,
            },
        });
        return { tagAdded: true, tagId: config.tagId };
    }
    async createTask(data, config) {
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
    async sendEmail(data, config) {
        this.logger.log(`Sending email to ${data.email || config.to}`);
        return { emailSent: true, to: data.email || config.to };
    }
    async updateField(data, config) {
        if (!data.id)
            return { error: 'No entity ID provided' };
        const updateData = {};
        updateData[config.fieldName] = config.fieldValue;
        await this.prisma.lead.update({
            where: { id: data.id },
            data: updateData,
        });
        return { fieldUpdated: true, field: config.fieldName };
    }
    async getExecutionHistory(workflowId, limit = 50) {
        const where = {};
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
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        activities_service_1.ActivitiesService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map