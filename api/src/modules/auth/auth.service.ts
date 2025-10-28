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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      return { success: false, message: 'Invalid credentials' };
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);

    const refreshToken = await bcrypt.hash(`${user.id}:${Date.now()}`, 10);
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        tokenExpiry,
        user,
      },
    };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, firstName: dto.firstName, lastName: dto.lastName },
    });
    return { success: true, data: { user } };
  }

  async refreshToken(dto: RefreshDto) {
    const record = await this.prisma.refreshToken.findUnique({ where: { token: dto.refreshToken } });
    if (!record || record.isRevoked || record.expiresAt <= new Date()) {
      return { success: false, message: 'Invalid refresh token' };
    }
    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return { success: false, message: 'User not found' };

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);

    return { success: true, data: { accessToken, tokenExpiry } };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { isRevoked: true } });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async profile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    return { success: true, data: { user } };
  }
}
