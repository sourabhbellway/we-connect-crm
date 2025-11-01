import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    limit = 10,
    type,
  }: {
    page?: number;
    limit?: number;
    type?: string;
  }) {
    const where: any = {};
    if (type) where.type = type as any;
    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);
    return { success: true, data: { items, total, page, limit } };
  }

  async create(dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        icon: dto.icon ?? undefined,
        iconColor: dto.iconColor ?? undefined,
        tags: dto.tags ?? [],
        metadata: (dto.metadata as any) ?? undefined,
        userId: dto.userId ?? undefined,
        superAdminId: dto.superAdminId ?? undefined,
      },
    });
    return { success: true, data: { activity } };
  }
}
