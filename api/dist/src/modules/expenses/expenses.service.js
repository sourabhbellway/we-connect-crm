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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permission_util_1 = require("../../common/utils/permission.util");
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, status, search, submittedBy, startDate, endDate, type, projectId, dealId, leadId, currency, }, user) {
        const where = { deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
            if (accessibleIds) {
                where.AND = [
                    {
                        OR: [
                            { submittedBy: { in: accessibleIds } },
                            { lead: { assignedTo: { in: accessibleIds } } },
                            { deal: { assignedTo: { in: accessibleIds } } },
                        ],
                    },
                ];
            }
        }
        if (status) {
            const values = status
                .split(',')
                .map((s) => s.trim().toUpperCase())
                .filter(Boolean);
            where.status = values.length > 1 ? { in: values } : values[0];
        }
        if (type)
            where.type = type;
        if (submittedBy)
            where.submittedBy = submittedBy;
        if (projectId)
            where.projectId = projectId;
        if (dealId)
            where.dealId = dealId;
        if (leadId)
            where.leadId = leadId;
        if (currency)
            where.currency = currency;
        if (startDate || endDate) {
            where.expenseDate = {};
            if (startDate)
                where.expenseDate.gte = new Date(startDate);
            if (endDate)
                where.expenseDate.lte = new Date(endDate);
        }
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { description: { contains: q, mode: 'insensitive' } },
                { remarks: { contains: q, mode: 'insensitive' } },
            ];
        }
        try {
            const [items, total] = await Promise.all([
                this.prisma.expense.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        submittedByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        approvedByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        rejectedByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        deal: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                        lead: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                company: true,
                            },
                        },
                    },
                }),
                this.prisma.expense.count({ where }),
            ]);
            return {
                success: true,
                data: { items, expenses: items, total, page, limit },
            };
        }
        catch (error) {
            console.error('Error in expenses.list:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
            if (accessibleIds) {
                where.AND = [
                    {
                        OR: [
                            { submittedBy: { in: accessibleIds } },
                            { lead: { assignedTo: { in: accessibleIds } } },
                            { deal: { assignedTo: { in: accessibleIds } } },
                        ],
                    },
                ];
            }
        }
        const expense = await this.prisma.expense.findFirst({
            where,
            include: {
                submittedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                approvedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                rejectedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                deal: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                lead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        company: true,
                    },
                },
            },
        });
        if (!expense)
            return { success: false, message: 'Expense not found' };
        return { success: true, data: { expense } };
    }
    async create(dto) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id: dto.submittedBy, deletedAt: null },
            });
            if (!user) {
                throw new common_1.HttpException({ success: false, message: 'User not found or has been deleted' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const createData = {
                expenseDate: new Date(dto.expenseDate),
                amount: dto.amount,
                type: dto.type,
                category: dto.category || dto.type || 'OTHER',
                description: dto.description ?? null,
                remarks: dto.remarks ?? null,
                receiptUrl: dto.receiptUrl ?? null,
                submittedBy: dto.submittedBy,
                projectId: dto.projectId ?? null,
                dealId: dto.dealId ?? null,
                leadId: dto.leadId ?? null,
                currency: dto.currency ?? 'USD',
                status: 'PENDING',
            };
            const expense = await this.prisma.expense.create({
                data: createData,
                include: {
                    submittedByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            return { success: true, data: { expense } };
        }
        catch (error) {
            console.error('Error creating expense:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Failed to create expense',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, dto) {
        const updateData = {
            expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
            amount: dto.amount,
            type: dto.type,
            description: dto.description,
            remarks: dto.remarks,
            receiptUrl: dto.receiptUrl,
            projectId: dto.projectId ?? undefined,
            dealId: dto.dealId ?? undefined,
            leadId: dto.leadId ?? undefined,
            currency: dto.currency,
            updatedAt: new Date(),
        };
        if (dto.category !== undefined) {
            updateData.category = dto.category;
        }
        else if (dto.type !== undefined) {
            updateData.category = dto.type;
        }
        const expense = await this.prisma.expense.update({
            where: { id },
            data: updateData,
            include: {
                submittedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return { success: true, data: { expense } };
    }
    async approve(id, dto) {
        const data = {
            status: dto.status,
            approvalRemarks: dto.approvalRemarks ?? null,
            updatedAt: new Date(),
        };
        if (dto.status === 'APPROVED') {
            data.approvedBy = dto.reviewedBy;
            data.approvedAt = new Date();
            data.rejectedBy = null;
        }
        else if (dto.status === 'REJECTED') {
            data.rejectedBy = dto.reviewedBy;
            data.approvedBy = null;
            data.approvedAt = null;
        }
        const expense = await this.prisma.expense.update({
            where: { id },
            data,
            include: {
                submittedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                approvedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                rejectedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        try {
            await this.prisma.activity.create({
                data: {
                    title: dto.status === 'APPROVED' ? 'Expense approved' : 'Expense rejected',
                    description: dto.status === 'APPROVED'
                        ? `Your expense #${expense.id} has been approved.`
                        : `Your expense #${expense.id} has been rejected.${data.approvalRemarks ? ' Remarks: ' + data.approvalRemarks : ''}`,
                    type: 'COMMUNICATION_LOGGED',
                    icon: 'DollarSign',
                    iconColor: dto.status === 'APPROVED' ? '#10B981' : '#EF4444',
                    metadata: {
                        expenseId: expense.id,
                        amount: expense.amount,
                        status: expense.status,
                    },
                    userId: expense.submittedByUser?.id ?? undefined,
                },
            });
        }
        catch (e) {
            console.error('Error creating expense activity:', e);
        }
        return { success: true, data: { expense } };
    }
    async remove(id) {
        await this.prisma.expense.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Expense deleted successfully' };
    }
    async getStats(userId) {
        const where = { deletedAt: null };
        if (userId)
            where.submittedBy = userId;
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.expense.aggregate({
                where,
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.expense.aggregate({
                where: { ...where, status: 'PENDING' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.expense.aggregate({
                where: { ...where, status: 'APPROVED' },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.expense.aggregate({
                where: { ...where, status: 'REJECTED' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            success: true,
            data: {
                total: {
                    count: total._count,
                    amount: total._sum.amount || 0,
                },
                pending: {
                    count: pending._count,
                    amount: pending._sum.amount || 0,
                },
                approved: {
                    count: approved._count,
                    amount: approved._sum.amount || 0,
                },
                rejected: {
                    count: rejected._count,
                    amount: rejected._sum.amount || 0,
                },
            },
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map