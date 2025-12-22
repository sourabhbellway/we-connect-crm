import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { getRoleBasedWhereClause } from '../../common/utils/permission.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { AutomationService } from '../automation/automation.service';
import { WorkflowTrigger } from '../automation/dto/create-workflow.dto';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly automationService: AutomationService,
  ) { }

  async list({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }, user?: any) {
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

    const where: any = { deletedAt: null, isActive: true };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
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
        // If there are existing OR conditions (from role-based filtering), combine them
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR; // Remove the original OR as it's now part of AND
      } else {
        // If no existing OR conditions, just apply search OR
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

    const normalized = rows.map((d: any) => ({
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

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const roleBasedWhere = await getRoleBasedWhereClause(user.userId, this.prisma);
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
    if (!deal) return { success: false, message: 'Deal not found' };
    const normalized: any = { ...deal, value: Number((deal as any).value ?? 0) };
    return { success: true, data: normalized };
  }

  async create(dto: CreateDealDto, userId?: number) {
    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        description: dto.description,
        value: (dto.value ?? 0) as any,
        currency: dto.currency ?? 'USD',
        status: (dto.status as any) ?? 'DRAFT',
        probability: dto.probability ?? 0,
        expectedCloseDate: dto.expectedCloseDate
          ? new Date(dto.expectedCloseDate)
          : null,
        assignedTo: dto.assignedTo || userId || null, // <--- Auto-assign to creator if not specified
        createdBy: userId || null, // <--- Save creator ID

        leadId: dto.leadId ?? null,
        companyId: dto.companyId ?? null,
      },
    });

    // Notify assigned user about new deal
    if (deal.assignedTo) {
      try {
        await this.notificationsService.create({
          userId: deal.assignedTo,
          type: NotificationType.DEAL_CREATED,
          title: 'New Deal Assigned',
          message: `Deal "${deal.title}" has been created and assigned to you.`,
          link: `/deals/${deal.id}`,
          metadata: {
            dealId: deal.id,
            leadId: deal.leadId,
            companyId: deal.companyId,
          } as any,
        });
      } catch (error) {
        console.error('Failed to send deal created notification:', error);
      }
    }

    // Trigger Automation
    try {
      // Execute asynchronously to not block response
      this.automationService.executeWorkflowsForTrigger(
        WorkflowTrigger.DEAL_CREATED,
        { ...deal, entityType: 'deal' },
      );
    } catch (error) {
      console.error('Failed to trigger deal automation:', error);
    }

    return {
      success: true,
      message: 'Deal created successfully',
      data: { deal },
    };
  }

  async update(id: number, dto: UpdateDealDto) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });

    const deal = await this.prisma.deal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        value: dto.value as any,
        currency: dto.currency,
        status: dto.status as any,
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

    // Notify assigned user on important status changes (WON/LOST)
    const previousStatus = existing?.status;
    const newStatus = deal.status;

    if (deal.assignedTo && previousStatus && previousStatus !== newStatus) {
      if (newStatus.toUpperCase() === 'WON') {
        try {
          await this.notificationsService.create({
            userId: deal.assignedTo,
            type: NotificationType.DEAL_WON,
            title: 'Deal Won',
            message: `Deal "${deal.title}" has been marked as won.`,
            link: `/deals/${deal.id}`,
            metadata: {
              dealId: deal.id,
              leadId: deal.leadId,
              companyId: deal.companyId,
            } as any,
          });
        } catch (error) {
          console.error('Failed to send deal won notification:', error);
        }
      } else if (newStatus.toUpperCase() === 'LOST') {
        try {
          await this.notificationsService.create({
            userId: deal.assignedTo,
            type: NotificationType.DEAL_LOST,
            title: 'Deal Lost',
            message: `Deal "${deal.title}" has been marked as lost.`,
            link: `/deals/${deal.id}`,
            metadata: {
              dealId: deal.id,
              leadId: deal.leadId,
              companyId: deal.companyId,
            } as any,
          });
        } catch (error) {
          console.error('Failed to send deal lost notification:', error);
        }
      }
    }

    // Trigger Automation
    try {
      // Always trigger DEAL_UPDATED
      this.automationService.executeWorkflowsForTrigger(
        WorkflowTrigger.DEAL_UPDATED,
        { ...deal, entityType: 'deal', previousStatus },
      );

      // Trigger DEAL_STAGE_CHANGED if status changed
      if (previousStatus !== newStatus) {
        this.automationService.executeWorkflowsForTrigger(
          WorkflowTrigger.DEAL_STAGE_CHANGED,
          { ...deal, entityType: 'deal', oldStatus: previousStatus, newStatus },
        );
      }
    } catch (error) {
      console.error('Failed to trigger deal automation during update:', error);
    }

    return {
      success: true,
      message: 'Deal updated successfully',
      data: { deal },
    };
  }

  async remove(id: number) {
    await this.prisma.deal.delete({ where: { id } });
    return { success: true, message: 'Deal deleted successfully' };
  }
}
