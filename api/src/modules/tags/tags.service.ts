import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.tag.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: items };
  }

  async create(dto: UpsertTagDto) {
    const tag = await this.prisma.tag.create({
      data: {
        name: dto.name,
        color: dto.color ?? '#3B82F6',
        description: dto.description ?? null,
      },
    });
    return { success: true, data: tag };
  }

  async update(id: number, dto: UpsertTagDto) {
    const tag = await this.prisma.tag.update({
      where: { id },
      data: {
        name: dto.name,
        color: dto.color,
        description: dto.description ?? null,
      },
    });
    return { success: true, data: tag };
  }

  async remove(id: number) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }
}
