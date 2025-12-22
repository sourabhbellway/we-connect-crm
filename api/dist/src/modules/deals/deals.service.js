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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permission_util_1 = require("../../common/utils/permission.util");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const automation_service_1 = require("../automation/automation.service");
const create_workflow_dto_1 = require("../automation/dto/create-workflow.dto");
let DealsService = class DealsService {
    prisma;
    notificationsService;
    automationService;
    constructor(prisma, notificationsService, automationService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.automationService = automationService;
    }
    async list({ page = 1, limit = 10, search, }, user) {
        const pageNum = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
        const where = { deletedAt: null, isActive: true };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        if (search && search.trim()) {
            const q = search.trim();
            const searchConditions = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { companies: { name: { contains: q, mode: 'insensitive' } } },
            ];
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    { OR: searchConditions }
                ];
                delete where.OR;
            }
            else {
                where.OR = searchConditions;
            }
        }
        const [rows, total] = await Promise.all([
            this.prisma.deal.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: [{ value: 'desc' }, { createdAt: 'desc' }],
                include: {
                    assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                    lead: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true } },
                    companies: { select: { id: true, name: true } },
                },
            }),
            this.prisma.deal.count({ where }),
        ]);
        const normalized = rows.map((d) => ({
            ...d,
            value: Number(d.value ?? 0),
        }));
        const pages = Math.max(1, Math.ceil(total / pageSize));
        return {
            success: true,
            data: {
                deals: normalized,
                pagination: {
                    page: pageNum,
                    limit: pageSize,
                    total,
                    pages,
                },
            },
        };
    }
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        const deal = await this.prisma.deal.findFirst({
            where,
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                lead: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true } },
                companies: { select: { id: true, name: true } },
            },
        });
        if (!deal)
            return { success: false, message: 'Deal not found' };
        const normalized = { ...deal, value: Number(deal.value ?? 0) };
        return { success: true, data: normalized };
    }
    async create(dto, userId) {
        const deal = await this.prisma.deal.create({
            data: {
                title: dto.title,
                description: dto.description,
                value: (dto.value ?? 0),
                currency: dto.currency ?? 'USD',
                status: dto.status ?? 'DRAFT',
                probability: dto.probability ?? 0,
                expectedCloseDate: dto.expectedCloseDate
                    ? new Date(dto.expectedCloseDate)
                    : null,
                assignedTo: dto.assignedTo || userId || null,
                createdBy: userId || null,
                leadId: dto.leadId ?? null,
                companyId: dto.companyId ?? null,
            },
        });
        if (deal.assignedTo) {
            try {
                await this.notificationsService.create({
                    userId: deal.assignedTo,
                    type: client_1.NotificationType.DEAL_CREATED,
                    title: 'New Deal Assigned',
                    message: `Deal "${deal.title}" has been created and assigned to you.`,
                    link: `/deals/${deal.id}`,
                    metadata: {
                        dealId: deal.id,
                        leadId: deal.leadId,
                        companyId: deal.companyId,
                    },
                });
            }
            catch (error) {
                console.error('Failed to send deal created notification:', error);
            }
        }
        try {
            this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.DEAL_CREATED, { ...deal, entityType: 'deal' });
        }
        catch (error) {
            console.error('Failed to trigger deal automation:', error);
        }
        return {
            success: true,
            message: 'Deal created successfully',
            data: { deal },
        };
    }
    async update(id, dto) {
        const existing = await this.prisma.deal.findUnique({ where: { id } });
        const deal = await this.prisma.deal.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                value: dto.value,
                currency: dto.currency,
                status: dto.status,
                probability: dto.probability,
                expectedCloseDate: dto.expectedCloseDate
                    ? new Date(dto.expectedCloseDate)
                    : undefined,
                assignedTo: dto.assignedTo ?? undefined,
                leadId: dto.leadId ?? undefined,
                companyId: dto.companyId ?? undefined,
                updatedAt: new Date(),
            },
        });
        const previousStatus = existing?.status;
        const newStatus = deal.status;
        if (deal.assignedTo && previousStatus && previousStatus !== newStatus) {
            if (newStatus.toUpperCase() === 'WON') {
                try {
                    await this.notificationsService.create({
                        userId: deal.assignedTo,
                        type: client_1.NotificationType.DEAL_WON,
                        title: 'Deal Won',
                        message: `Deal "${deal.title}" has been marked as won.`,
                        link: `/deals/${deal.id}`,
                        metadata: {
                            dealId: deal.id,
                            leadId: deal.leadId,
                            companyId: deal.companyId,
                        },
                    });
                }
                catch (error) {
                    console.error('Failed to send deal won notification:', error);
                }
            }
            else if (newStatus.toUpperCase() === 'LOST') {
                try {
                    await this.notificationsService.create({
                        userId: deal.assignedTo,
                        type: client_1.NotificationType.DEAL_LOST,
                        title: 'Deal Lost',
                        message: `Deal "${deal.title}" has been marked as lost.`,
                        link: `/deals/${deal.id}`,
                        metadata: {
                            dealId: deal.id,
                            leadId: deal.leadId,
                            companyId: deal.companyId,
                        },
                    });
                }
                catch (error) {
                    console.error('Failed to send deal lost notification:', error);
                }
            }
        }
        try {
            this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.DEAL_UPDATED, { ...deal, entityType: 'deal', previousStatus });
            if (previousStatus !== newStatus) {
                this.automationService.executeWorkflowsForTrigger(create_workflow_dto_1.WorkflowTrigger.DEAL_STAGE_CHANGED, { ...deal, entityType: 'deal', oldStatus: previousStatus, newStatus });
            }
        }
        catch (error) {
            console.error('Failed to trigger deal automation during update:', error);
        }
        return {
            success: true,
            message: 'Deal updated successfully',
            data: { deal },
        };
    }
    async remove(id) {
        await this.prisma.deal.delete({ where: { id } });
        return { success: true, message: 'Deal deleted successfully' };
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        automation_service_1.AutomationService])
], DealsService);
//# sourceMappingURL=deals.service.js.map