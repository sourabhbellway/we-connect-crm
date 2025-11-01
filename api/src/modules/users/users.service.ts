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
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      roles,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  async findAll() {
    const rows = await this.prisma.user.findMany({
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

  async findOne(id: number) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
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
      },
    });
    return { success: true, data: { user } };
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({ where: { id }, data });
    return { success: true, data: { user } };
  }
}
