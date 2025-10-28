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
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deal.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) return { success: false, message: 'Deal not found' };
    return { success: true, data: { deal } };
  }

  async create(dto: CreateDealDto) {
    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        description: dto.description,
        value: dto.value as any,
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
