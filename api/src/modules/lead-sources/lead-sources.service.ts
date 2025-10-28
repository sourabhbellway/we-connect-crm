import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertLeadSourceDto } from './dto/upsert-lead-source.dto';

@Injectable()
export class LeadSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.leadSource.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: items };
  }

  async create(dto: UpsertLeadSourceDto) {
    const ls = await this.prisma.leadSource.create({
      data: { name: dto.name, description: dto.description ?? null },
    });
    return { success: true, data: ls };
  }

  async update(id: number, dto: UpsertLeadSourceDto) {
    const ls = await this.prisma.leadSource.update({
      where: { id },
      data: { name: dto.name, description: dto.description ?? null },
    });
    return { success: true, data: ls };
  }

  async remove(id: number) {
    await this.prisma.leadSource.delete({ where: { id } });
    return { success: true };
  }
}
