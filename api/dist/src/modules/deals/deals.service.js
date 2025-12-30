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
const escapeCsv = (v) => {
    if (v === null || v === undefined)
        return '';
    const s = String(v);
    if (/[",\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
};
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
                invoices: {
                    include: {
                        payments: {
                            include: { createdByUser: { select: { id: true, firstName: true, lastName: true } } }
                        }
                    }
                },
                quotations: true,
            },
        });
        if (!deal)
            return { success: false, message: 'Deal not found' };
        const payments = deal.invoices?.flatMap(inv => inv.payments?.map(p => ({ ...p, invoiceNumber: inv.invoiceNumber })) || []) || [];
        const normalized = {
            ...deal,
            value: Number(deal.value ?? 0),
            payments,
        };
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
        try {
            await this.prisma.activity.create({
                data: {
                    type: 'DEAL_CREATED',
                    title: 'New Deal Created',
                    description: `Deal "${deal.title}" was created.`,
                    userId: userId || 1,
                    leadId: deal.leadId || undefined,
                    metadata: { dealId: deal.id },
                }
            });
        }
        catch (error) {
            console.error('Failed to log deal creation activity:', error);
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
        try {
            await this.prisma.activity.create({
                data: {
                    type: 'DEAL_UPDATED',
                    title: 'Deal Updated',
                    description: `Deal "${deal.title}" was updated.`,
                    userId: deal.assignedTo || 1,
                    leadId: deal.leadId || undefined,
                    metadata: {
                        dealId: deal.id,
                        oldStatus: previousStatus,
                        newStatus: deal.status,
                    },
                }
            });
        }
        catch (error) {
            console.error('Failed to log deal update activity:', error);
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
    async bulkAssign(dto) {
        await this.prisma.deal.updateMany({
            where: { id: { in: dto.dealIds } },
            data: { assignedTo: dto.userId },
        });
        return { success: true, message: 'Deals assigned successfully' };
    }
    async bulkImportFromCsv(file, userId) {
        try {
            if (!file || !file.buffer) {
                return { success: false, message: 'Invalid file' };
            }
            const csvContent = file.buffer.toString('utf-8');
            const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length < 2) {
                return { success: false, message: 'CSV file must contain headers and at least one row of data' };
            }
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const requiredFields = ['title', 'value'];
            const missingFields = requiredFields.filter(field => !headers.includes(field));
            if (missingFields.length > 0) {
                return { success: false, message: `CSV must contain these columns: ${missingFields.join(', ')}` };
            }
            const results = {
                success: true,
                data: {
                    imported: 0,
                    failed: 0,
                    errors: [],
                    message: '',
                },
            };
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    if (!row.title || !row.value) {
                        results.data.errors.push({ row: i + 1, error: 'Missing required fields: title or value' });
                        results.data.failed++;
                        continue;
                    }
                    await this.prisma.deal.create({
                        data: {
                            title: row.title,
                            description: row.description || null,
                            value: (parseFloat(row.value) || 0),
                            currency: row.currency || 'USD',
                            status: row.status ? row.status.toUpperCase() : 'DRAFT',
                            probability: parseInt(row.probability) || 0,
                            expectedCloseDate: row.expectedclosedate ? new Date(row.expectedclosedate) : null,
                            createdBy: userId,
                            assignedTo: userId,
                        },
                    });
                    results.data.imported++;
                }
                catch (error) {
                    results.data.errors.push({ row: i + 1, error: error.message || 'Unknown error' });
                    results.data.failed++;
                }
            }
            results.data.message = `Import completed. Imported: ${results.data.imported}, Failed: ${results.data.failed}`;
            return results;
        }
        catch (error) {
            return { success: false, message: error.message || 'Failed to import deals from CSV' };
        }
    }
    async bulkExport(opts = {}, user) {
        const where = { deletedAt: null };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        if (opts.search) {
            const s = String(opts.search).trim();
            const searchConditions = [
                { title: { contains: s, mode: 'insensitive' } },
                { description: { contains: s, mode: 'insensitive' } },
            ];
            if (where.AND) {
                where.AND.push({ OR: searchConditions });
            }
            else {
                where.OR = searchConditions;
            }
        }
        const deals = await this.prisma.deal.findMany({
            where,
            include: { assignedUser: true, lead: true, companies: true },
            orderBy: { createdAt: 'desc' },
        });
        const headers = [
            'title',
            'description',
            'value',
            'currency',
            'status',
            'probability',
            'expectedCloseDate',
            'company',
            'contact',
            'assignedTo',
            'createdAt',
        ];
        const rows = [headers.join(',')];
        for (const d of deals) {
            const row = [
                escapeCsv(d.title),
                escapeCsv(d.description),
                escapeCsv(d.value),
                escapeCsv(d.currency),
                escapeCsv(d.status),
                escapeCsv(d.probability),
                escapeCsv(d.expectedCloseDate ? new Date(d.expectedCloseDate).toISOString() : ''),
                escapeCsv(d.companies?.name || ''),
                escapeCsv(d.lead ? `${d.lead.firstName} ${d.lead.lastName}` : ''),
                escapeCsv(d.assignedUser ? `${d.assignedUser.firstName} ${d.assignedUser.lastName}` : ''),
                escapeCsv(d.createdAt ? new Date(d.createdAt).toISOString() : ''),
            ];
            rows.push(row.join(','));
        }
        return rows.join('\r\n');
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