import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async mapUser(u: any) {
    if (!u) return null;
    const roles = (u.roles || []).map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: (ur.role.permissions || []).map((rp: any) => ({
        id: rp.permission.id,
        key: rp.permission.key,
        name: rp.permission.name,
        module: rp.permission.module,
      })),
    }));
    const manager = u.manager
      ? {
          id: u.manager.id,
          fullName: `${u.manager.firstName ?? ''} ${u.manager.lastName ?? ''}`.trim(),
          email: u.manager.email,
        }
      : null;
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      dateOfBirth: u.dateOfBirth ?? undefined,
      managerId: u.managerId ?? undefined,
      manager,
      roles,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      deletedAt: u.deletedAt,
    };
  }

  async findAll({
    page,
    limit,
    search,
    status,
    isDeleted,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | string;
    isDeleted?: boolean;
  } = {}) {
    // If page/limit are provided, use pagination
    if (page !== undefined && limit !== undefined) {
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

      const where: any = {};
      
      // Handle deletedAt filter
      if (isDeleted === true) {
        where.deletedAt = { not: null };
      } else if (isDeleted === false || isDeleted === undefined) {
        where.deletedAt = null;
      }

      // Handle status filter
      if (status && String(status).toLowerCase().trim() === 'active') {
        where.isActive = true;
      } else if (status && String(status).toLowerCase().trim() === 'inactive') {
        where.isActive = false;
      }

      if (search && String(search).trim() !== '') {
        const q = String(search).trim();
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [totalItems, rows] = await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * pageSize,
          take: pageSize,
          include: {
            manager: { select: { id: true, firstName: true, lastName: true, email: true } },
            roles: {
              include: {
                role: {
                  include: { permissions: { include: { permission: true } } },
                },
              },
            },
          },
        }),
      ]);

      const users = await Promise.all(rows.map((u) => this.mapUser(u)));
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      
      return {
        success: true,
        data: {
          users,
          pagination: {
            totalItems,
            currentPage: pageNum,
            pageSize,
            totalPages,
          },
        },
      };
    }

    // Legacy: return all users without pagination
    const where: any = { deletedAt: null };
    if (status && String(status).toLowerCase().trim() === 'active') {
      (where as any).isActive = true;
    } else if (status && String(status).toLowerCase().trim() === 'inactive') {
      (where as any).isActive = false;
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.user.findMany({
      where,
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const users = await Promise.all(rows.map((u) => this.mapUser(u)));
    return { success: true, data: users };
  }

  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
    ]);
    const inactiveUsers = Math.max(0, totalUsers - activeUsers);
    return {
      success: true,
      data: {
        stats: { totalUsers, activeUsers, inactiveUsers, newUsers },
      },
    };
  }

  async findOne(id: number) {
    const u = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
    if (!u) return { success: false, message: 'User not found' };
    return { success: true, data: await this.mapUser(u) };
  }

  async assignRoles(userId: number, roleIds: number[]) {
    // Clear existing roles
    await this.prisma.userRole.deleteMany({ where: { userId } });
    if (roleIds?.length) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    }
    return { success: true };
  }

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        managerId: dto.managerId ?? null,
      },
    });
    return { success: true, data: { user } };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) return { success: false, message: 'User not found' };

    const data: any = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.managerId !== undefined) data.managerId = dto.managerId;

    const updated = await this.prisma.user.update({ where: { id }, data });
    return { success: true, data: { user: updated } };
  }

  async updateProfile(id: number, dto: { firstName?: string; lastName?: string; email?: string; dateOfBirth?: string | null }) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) return { success: false, message: 'User not found' };

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;

    if (dto.dateOfBirth !== undefined) {
      if (dto.dateOfBirth === null || dto.dateOfBirth === '') {
        data.dateOfBirth = null;
      } else {
        const d = new Date(dto.dateOfBirth);
        if (isNaN(d.getTime())) {
          return { success: false, message: 'Invalid dateOfBirth' };
        }
        data.dateOfBirth = d;
      }
    }

    const updated = await this.prisma.user.update({ where: { id }, data });
    return { success: true, data: { user: updated } };
  }

  async updateAvatar(id: number, fileName: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) return { success: false, message: 'User not found' };
    const updated = await this.prisma.user.update({ where: { id }, data: { profilePicture: fileName } });
    return { success: true, data: { user: updated } };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) return { success: false, message: 'User not found' };

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'User moved to trash' };
  }

  async restore(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!user) return { success: false, message: 'User not found in trash' };

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return { success: true, message: 'User restored successfully' };
  }
}
