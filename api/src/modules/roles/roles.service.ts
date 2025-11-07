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
    isDeleted,
  }: {
    search?: string;
    page?: number;
    limit?: number;
    isDeleted?: boolean;
  }) {
    const where: any = {};
    
    // Handle deletedAt filter
    if (isDeleted === true) {
      where.deletedAt = { not: null };
    } else if (isDeleted === false || isDeleted === undefined) {
      where.deletedAt = null;
    }

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
        include: {
          permissions: { include: { permission: true } },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const data = items.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isActive: r.isActive,
      accessScope: r.accessScope,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt,
      permissions: r.permissions.map((rp) => rp.permission),
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { 
      success: true, 
      data: { 
        roles: data, 
        pagination: {
          totalItems: total,
          currentPage: page,
          pageSize: limit,
          totalPages,
        },
      } 
    };
  }

  async create(dto: UpsertRoleDto) {
    // Ensure unique by name (case-sensitive unique exists too)
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        accessScope: dto.accessScope,
        permissions: {
          create: dto.permissionIds.map((pid) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    return {
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        accessScope: role.accessScope,
        permissions: role.permissions.map((rp) => rp.permission),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    };
  }

  async update(id: number, dto: UpsertRoleDto) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
    });
    if (!role) return { success: false, message: 'Role not found' };

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description ?? null,
        accessScope: dto.accessScope,
        permissions: {
          deleteMany: {},
          create: dto.permissionIds.map((pid) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isActive: updated.isActive,
        accessScope: updated.accessScope,
        permissions: updated.permissions.map((rp) => rp.permission),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async remove(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
    });
    if (!role) return { success: false, message: 'Role not found' };

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Role moved to trash' };
  }

  async restore(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!role) return { success: false, message: 'Role not found in trash' };

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: null },
    });
    return { success: true, message: 'Role restored successfully' };
  }
}
