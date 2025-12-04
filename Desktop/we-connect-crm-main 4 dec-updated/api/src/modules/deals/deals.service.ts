import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, DealStatus } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list({
    page = 1,
    limit = 10,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

    const where: any = { deletedAt: null, isActive: true };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { companies: { name: { contains: q, mode: 'insensitive' } } },

      ];
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

  async getById(id: number) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, deletedAt: null },
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

  async create(dto: CreateDealDto) {
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
        assignedTo: dto.assignedTo ?? null,
      
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
    const previousStatus = existing?.status as DealStatus | undefined;
    const newStatus = deal.status as DealStatus;

    if (deal.assignedTo && previousStatus && previousStatus !== newStatus) {
      if (newStatus === DealStatus.WON) {
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
      } else if (newStatus === DealStatus.LOST) {
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
