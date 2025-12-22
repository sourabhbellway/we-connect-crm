import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { getAccessibleUserIds } from '../../common/utils/permission.util';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) { }

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
    currency,
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
    currency?: string;
  }, user?: any) {
    const where: any = { deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
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
      where.status = values.length > 1 ? { in: values as any } : values[0];
    }

    if (type) where.type = type;
    if (submittedBy) where.submittedBy = submittedBy;
    if (projectId) where.projectId = projectId;
    if (dealId) where.dealId = dealId;
    if (leadId) where.leadId = leadId;
    if (currency) where.currency = currency;

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
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
    } catch (error: any) {
      console.error('Error in expenses.list:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
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

    if (!expense) return { success: false, message: 'Expense not found' };
    return { success: true, data: { expense } };
  }

  async create(dto: CreateExpenseDto) {
    try {
      // Validate that submittedBy user exists and is not deleted
      const user = await this.prisma.user.findFirst({
        where: { id: dto.submittedBy, deletedAt: null },
      });

      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found or has been deleted' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const createData: any = {
        expenseDate: new Date(dto.expenseDate),
        amount: dto.amount,
        type: dto.type as any,
        category: dto.category || dto.type || 'OTHER', // Use category if provided, otherwise use type as category
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
    } catch (error: any) {
      console.error('Error creating expense:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Failed to create expense',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const updateData: any = {
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      amount: dto.amount,
      type: dto.type as any,
      description: dto.description,
      remarks: dto.remarks,
      receiptUrl: dto.receiptUrl,
      projectId: dto.projectId ?? undefined,
      dealId: dto.dealId ?? undefined,
      leadId: dto.leadId ?? undefined,
      currency: dto.currency,
      updatedAt: new Date(),
    };

    // Handle category if provided, otherwise keep existing
    if (dto.category !== undefined) {
      updateData.category = dto.category;
    } else if (dto.type !== undefined) {
      // If type is updated but category not provided, use type as category
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

  async approve(id: number, dto: ApproveExpenseDto) {
    const data: any = {
      status: dto.status,
      approvalRemarks: dto.approvalRemarks ?? null,
      updatedAt: new Date(),
    };

    if (dto.status === 'APPROVED') {
      data.approvedBy = dto.reviewedBy;
      data.approvedAt = new Date();
      data.rejectedBy = null;
    } else if (dto.status === 'REJECTED') {
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

    // Create a simple activity to notify the submitter
    try {
      await this.prisma.activity.create({
        data: {
          title: dto.status === 'APPROVED' ? 'Expense approved' : 'Expense rejected',
          description:
            dto.status === 'APPROVED'
              ? `Your expense #${expense.id} has been approved.`
              : `Your expense #${expense.id} has been rejected.${data.approvalRemarks ? ' Remarks: ' + data.approvalRemarks : ''}`,
          type: 'COMMUNICATION_LOGGED' as any,
          icon: 'DollarSign',
          iconColor: dto.status === 'APPROVED' ? '#10B981' : '#EF4444',
          metadata: {
            expenseId: expense.id,
            amount: expense.amount,
            status: expense.status,
          } as any,
          userId: expense.submittedByUser?.id ?? undefined,
        },
      });
    } catch (e) {
      // Non-blocking
      console.error('Error creating expense activity:', e);
    }

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
