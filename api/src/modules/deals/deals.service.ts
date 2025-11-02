import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

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
        { contact: { firstName: { contains: q, mode: 'insensitive' } } },
        { contact: { lastName: { contains: q, mode: 'insensitive' } } },
        { contact: { email: { contains: q, mode: 'insensitive' } } },
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
          contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          lead: { select: { id: true, firstName: true, lastName: true, email: true } },
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
        contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
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
        contactId: dto.contactId ?? null,
        leadId: dto.leadId ?? null,
        companyId: dto.companyId ?? null,
      },
    });
    return {
      success: true,
      message: 'Deal created successfully',
      data: { deal },
    };
  }

  async update(id: number, dto: UpdateDealDto) {
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
        contactId: dto.contactId ?? undefined,
        leadId: dto.leadId ?? undefined,
        companyId: dto.companyId ?? undefined,
        updatedAt: new Date(),
      },
    });
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
