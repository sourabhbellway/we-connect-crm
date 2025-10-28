import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    search,
    page = 1,
    limit = 10,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [{ name: { contains: q, mode: 'insensitive' } }];
    }
    const [items, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async create(dto: UpsertRoleDto) {
    const role = await this.prisma.role.create({
      data: { name: dto.name, description: dto.description ?? null },
    });
    return { success: true, data: role };
  }

  async update(id: number, dto: UpsertRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: { name: dto.name, description: dto.description ?? null },
    });
    return { success: true, data: role };
  }

  async remove(id: number) {
    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }
}
