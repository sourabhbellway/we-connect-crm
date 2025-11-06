import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcryptjs';

const REFRESH_LIFETIME_DAYS = 7;
const ACCESS_LIFETIME_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private tokenExpiryISO(hours: number) {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  private async buildUserWithRoles(userId: number) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        lastLogin: true,
        profilePicture: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: { id: true, name: true, key: true, module: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!u) return null;

    let transformedRoles = u.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions.map((rp) => rp.permission),
    }));

    // Bootstrap: if user has no roles yet, grant a synthetic admin with broad permissions
    if (!transformedRoles.length) {
      const keys = [
        'dashboard.read',
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'role.create',
        'role.read',
        'role.update',
        'role.delete',
        'permission.create',
        'permission.read',
        'permission.update',
        'permission.delete',
        'lead.create',
        'lead.read',
        'lead.update',
        'lead.delete',
        'contact.create',
        'contact.read',
        'contact.update',
        'contact.delete',
        'deal.create',
        'deal.read',
        'deal.update',
        'deal.delete',
        'business_settings.read',
        'business_settings.update',
      ];
      transformedRoles = [
        {
          id: 0,
          name: 'admin',
          permissions: keys.map((key) => ({
            id: 0,
            key,
            name: key.toUpperCase(),
            module: key.split('.')[0].toUpperCase(),
          })),
        },
      ];
    }

    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      lastLogin: u.lastLogin,
      profilePicture: u.profilePicture || undefined,
      roles: transformedRoles,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user
      .findUnique({ where: { email: dto.email } })
      .catch(() => null);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      return { success: false, message: 'Invalid credentials' };
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: `${ACCESS_LIFETIME_HOURS}h` });

    const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);

    const refreshToken = await bcrypt.hash(`${user.id}:${Date.now()}`, 10);
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + REFRESH_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    const enrichedUser = await this.buildUserWithRoles(user.id);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenExpiry,
        user: enrichedUser,
      },
    };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    const enrichedUser = await this.buildUserWithRoles(user.id);
    return { success: true, data: { user: enrichedUser } };
  }

  async refreshToken(dto: RefreshDto) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
    });
    if (!record || record.isRevoked || record.expiresAt <= new Date()) {
      return { success: false, message: 'Invalid refresh token' };
    }
    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });
    if (!user) return { success: false, message: 'User not found' };

    const payload = { userId: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);

    return { success: true, data: { accessToken, tokenExpiry } };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async profile(userId: number) {
    try {
      const user = await this.buildUserWithRoles(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      return { success: true, data: { user } };
    } catch (err) {
      return { success: false, message: 'Failed to load profile' };
    }
  }
}
