import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecent(limit = 5) {
    const items = await this.prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { items } };
  }

  async getStats() {
    const total = await this.prisma.activity.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.activity.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
    return { success: true, data: { total, today: todayCount } };
  }

  async getDeletedData({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }) {
    const [users, leads] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: { not: null } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.lead.findMany({
        where: { deletedAt: { not: null } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { deletedAt: 'desc' },
      }),
    ]);
    const total = users.length + leads.length;
    return { success: true, data: { users, leads, total, page, limit } };
  }

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
