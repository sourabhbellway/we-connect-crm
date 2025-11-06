import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    status,
    search,
    submittedBy,
    startDate,
    endDate,
    type,
    projectId,
    dealId,
    leadId,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    submittedBy?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    projectId?: number;
    dealId?: number;
    leadId?: number;
  }) {
    const where: any = { deletedAt: null };

    if (status) {
      const values = status
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      where.status = values.length > 1 ? { in: values as any } : values[0];
    }

    if (type) where.type = type;
    if (submittedBy) where.submittedBy = submittedBy;
    if (projectId) where.projectId = projectId;
    if (dealId) where.dealId = dealId;
    if (leadId) where.leadId = leadId;

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { category: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { remarks: { contains: q, mode: 'insensitive' } },
      ];
    }

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

  async getById(id: number) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, deletedAt: null },
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

    if (!expense) return { success: false, message: 'Expense not found' };
    return { success: true, data: { expense } };
  }

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        expenseDate: new Date(dto.expenseDate),
        amount: dto.amount,
        type: dto.type as any,
        category: dto.category,
        description: dto.description ?? null,
        remarks: dto.remarks ?? null,
        receiptUrl: dto.receiptUrl ?? null,
        submittedBy: dto.submittedBy,
        projectId: dto.projectId ?? null,
        dealId: dto.dealId ?? null,
        leadId: dto.leadId ?? null,
        currency: dto.currency ?? 'USD',
        status: 'PENDING',
      },
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

  async update(id: number, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        amount: dto.amount,
        type: dto.type as any,
        category: dto.category,
        description: dto.description,
        remarks: dto.remarks,
        receiptUrl: dto.receiptUrl,
        projectId: dto.projectId ?? undefined,
        dealId: dto.dealId ?? undefined,
        leadId: dto.leadId ?? undefined,
        currency: dto.currency,
        updatedAt: new Date(),
      },
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

  async approve(id: number, dto: ApproveExpenseDto) {
    const data: any = {
      status: dto.status,
      approvalRemarks: dto.approvalRemarks ?? null,
      updatedAt: new Date(),
    };

    if (dto.status === 'APPROVED') {
      data.approvedBy = dto.reviewedBy;
      data.rejectedBy = null;
    } else if (dto.status === 'REJECTED') {
      data.rejectedBy = dto.reviewedBy;
      data.approvedBy = null;
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

    return { success: true, data: { expense } };
  }

  async remove(id: number) {
    await this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Expense deleted successfully' };
  }

  async getStats(userId?: number) {
    const where: any = { deletedAt: null };
    if (userId) where.submittedBy = userId;

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
}
