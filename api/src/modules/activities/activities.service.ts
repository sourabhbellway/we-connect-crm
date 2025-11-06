import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    try {
      const [users, leads, roles] = await Promise.all([
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
        this.prisma.role.findMany({
          where: { deletedAt: { not: null } },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { deletedAt: 'desc' },
        }),
      ]);
      
      const [usersTotal, leadsTotal, rolesTotal] = await Promise.all([
        this.prisma.user.count({ where: { deletedAt: { not: null } } }),
        this.prisma.lead.count({ where: { deletedAt: { not: null } } }),
        this.prisma.role.count({ where: { deletedAt: { not: null } } }),
      ]);
      
      return {
        success: true,
        data: {
          users: { records: users, total: usersTotal, pages: Math.ceil(usersTotal / limit) },
          leads: { records: leads, total: leadsTotal, pages: Math.ceil(leadsTotal / limit) },
          roles: { records: roles, total: rolesTotal, pages: Math.ceil(rolesTotal / limit) },
        },
      };
    } catch (error: any) {
      console.error('Error in activities.getDeletedData:', error);
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  // --- UPDATED create METHOD ---
  // Ab ye method leadId ko bhi handle kar sakta hai
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
        // YE LINE UPDATE KI GAYI HAI - leadId ko bhi save karta hai
        leadId: dto.leadId ?? undefined,
      },
    });
    return { success: true, data: { activity } };
  }

  // --- NEW METHOD ---
  // Ye method kisi specific lead ki saari activities ko page-wise deta hai
  async getActivitiesByLeadId(
    leadId: number,
    { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
  ) {
    const where = { leadId }; // Sirf is leadId wali activities filter karta hai
    
    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Sabse pehle sabse recent activity
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { success: true, data: { items, total, page, limit } };
  }
}