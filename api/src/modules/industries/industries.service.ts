import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertIndustryDto } from './dto/upsert-industry.dto';
import { UpsertIndustryFieldDto } from './dto/upsert-industry-field.dto';

@Injectable()
export class IndustriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const industries = await this.prisma.industry.findMany({
      include: { fields: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: { industries } };
  }

  async create(dto: UpsertIndustryDto) {
    const industry = await this.prisma.industry.create({
      data: {
        name: dto.name,
        slug: dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
    return { success: true, data: { industry } };
  }

  async update(id: number, dto: UpsertIndustryDto) {
    const updateData: any = { name: dto.name };
    if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }
    const industry = await this.prisma.industry.update({
      where: { id },
      data: updateData,
    });
    return { success: true, data: { industry } };
  }

  async remove(id: number) {
    await this.prisma.industry.delete({ where: { id } });
    return { success: true };
  }

  async addField(industryId: number, dto: UpsertIndustryFieldDto) {
    const field = await this.prisma.industryField.create({
      data: {
        industryId,
        name: dto.name,
        key: dto.key || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        type: (dto.type as any) || 'TEXT',
        isRequired: !!dto.isRequired,
      },
    });
    return { success: true, data: { field } };
  }

  async updateField(fieldId: number, dto: UpsertIndustryFieldDto) {
    const field = await this.prisma.industryField.update({
      where: { id: fieldId },
      data: {
        name: dto.name,
        key: dto.key,
        type: dto.type as any,
        isRequired: !!dto.isRequired,
        isActive: dto.isActive ?? undefined,
      },
    });
    return { success: true, data: { field } };
  }

  async removeField(fieldId: number) {
    await this.prisma.industryField.delete({ where: { id: fieldId } });
    return { success: true };
  }
}
