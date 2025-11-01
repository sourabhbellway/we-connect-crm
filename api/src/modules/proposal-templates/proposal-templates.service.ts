import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertProposalTemplateDto } from './dto/upsert-proposal-template.dto';

@Injectable()
export class ProposalTemplatesService {
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
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.proposalTemplate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.proposalTemplate.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async getById(id: number) {
    const item = await this.prisma.proposalTemplate.findUnique({
      where: { id },
    });
    if (!item) return { success: false, message: 'Template not found' };
    return { success: true, data: { template: item } };
  }

  async create(dto: UpsertProposalTemplateDto) {
    const item = await this.prisma.proposalTemplate.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        content: dto.content,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
        headerHtml: dto.headerHtml ?? null,
        footerHtml: dto.footerHtml ?? null,
        styles: (dto.styles as any) ?? undefined,
        variables: (dto.variables as any) ?? undefined,
        previewImage: dto.previewImage ?? null,
        category: dto.category ?? undefined,
      },
    });
    return { success: true, data: { template: item } };
  }

  async update(id: number, dto: UpsertProposalTemplateDto) {
    const item = await this.prisma.proposalTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content,
        isActive: dto.isActive,
        isDefault: dto.isDefault,
        headerHtml: dto.headerHtml,
        footerHtml: dto.footerHtml,
        styles: dto.styles as any,
        variables: dto.variables as any,
        previewImage: dto.previewImage,
        category: dto.category,
        updatedAt: new Date(),
      },
    });
    return { success: true, data: { template: item } };
  }

  async remove(id: number) {
    await this.prisma.proposalTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}
