import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) { }

  async list({
    search,
    status,
    page = 1,
    limit = 10,
    isDeleted,
  }: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    isDeleted?: boolean;
  }) {
    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (isDeleted === true) {
      where.deletedAt = { not: null };
    } else if (isDeleted === false || isDeleted === undefined) {
      where.deletedAt = null;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [{ name: { contains: q, mode: 'insensitive' } }];
    }

    const [items, total, totalPermissions] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: { include: { permission: true } },
          users: true,
        },
      }),
      this.prisma.role.count({ where }),
      this.prisma.permission.count(),
    ]);

    const data = items.map((r) => {
      const permissions = r.permissions.map((rp) => rp.permission);
      const isAdmin = r.name === 'Admin';

      return {
        id: r.id,
        name: r.name,
        description: r.description,
        isActive: r.isActive,
        accessScope: r.accessScope,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        deletedAt: r.deletedAt,
        permissions,
        users: r.users,
        permissionsCount: isAdmin ? totalPermissions : permissions.length,
        usersCount: r.users.length,
      };
    });

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
    const normalizedName = dto.name?.trim();
    const existing = await this.prisma.role.findFirst({
      where: {
        deletedAt: null,
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return { success: false, message: 'Role name already exists' };
    }

    try {
      const role = await this.prisma.role.create({
        data: {
          name: normalizedName,
          description: dto.description ?? null,
          accessScope: dto.accessScope,
          isActive: dto.isActive ?? true,
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
        message: 'Role created successfully!',
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
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return { success: false, message: 'Role name already exists' };
      }
      throw error;
    }
  }

  async getUsersByRole(roleId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { roleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    return {
      success: true,
      data: userRoles.map((ur) => ur.user),
    };
  }


  async update(id: number, dto: UpsertRoleDto) {

    let warning: string | null = null;
    let affectedUsers: any[] = [];
    let affectedUserIds: number[] = [];

    if (dto.isActive === false) {
      const userRoles = await this.prisma.userRole.findMany({
        where: { roleId: id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (userRoles.length > 0) {
        affectedUsers = userRoles.map((ur) => ur.user);
        affectedUserIds = userRoles.map((ur) => ur.user.id);
        warning = `This role is assigned to ${userRoles.length} user(s). Those users will not be able to log in.`;
      }
    }

    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
    });
    if (!role) return { success: false, message: 'Role not found' };

    const normalizedName = dto.name?.trim();
    const duplicateName = await this.prisma.role.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
        deletedAt: null,
        NOT: { id },
      },
    });

    if (duplicateName) {
      return { success: false, message: 'Role name already exists' };
    }

    try {
      const updated = await this.prisma.role.update({
        where: { id },
        data: {
          name: normalizedName,
          description: dto.description ?? null,
          accessScope: dto.accessScope,
          isActive: dto.isActive ?? role.isActive,
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
        warning,
        affectedUsers,
        affectedUserIds,
        message: 'Role updated successfully!',
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
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return { success: false, message: 'Role name already exists' };
      }
      throw error;
    }
  }


  async remove(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
    });
    if (!role) return { success: false, message: 'Role not found' };

    const assignmentsCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (assignmentsCount > 0) {
      return {
        success: false,
        message:
          'Cannot delete this role because it is assigned to one or more users. Please remove this role from all users first.',
      };
    }

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


  async deletePermanently(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!role) return { success: false, message: 'Role not found in trash' };

    try {
      await this.prisma.role.delete({ where: { id } });
      return { success: true, message: 'Role deleted permanently' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        return {
          success: false,
          message:
            'Unable to delete this role permanently because other records still reference it. Please detach it from related data first.',
        };
      }
      throw error;
    }
  }
}
