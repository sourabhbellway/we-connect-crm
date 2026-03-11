import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly activitiesService: ActivitiesService,
    private readonly config: ConfigService,
  ) {}

  private tokenExpiryISO(hours: number) {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  private async generateAuthTokens(
    userId: number,
    email: string,
    oldSessionId?: number,
  ) {
    const accessLifetimeHours =
      this.config.get<number>('auth.accessLifetimeHours') || 24;
    const refreshLifetimeDays =
      this.config.get<number>('auth.refreshLifetimeDays') || 7;

    // Generate unique session token (JTI)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshLifetimeDays);

    // Create a new login session record if Prisma is available (skip in test env)
    let session: any = { id: undefined };
    if (
      this.prisma &&
      this.prisma.loginSession &&
      this.prisma.loginSession.create
    ) {
      session = await this.prisma.loginSession.create({
        data: {
          userId,
          token: sessionToken,
          expiresAt,
          isActive: true,
        },
      });
    }

    // Revoke old session if this is a rotation (BUG-005 rotation) and Prisma is available
    if (
      oldSessionId &&
      this.prisma &&
      this.prisma.loginSession &&
      this.prisma.loginSession.updateMany
    ) {
      await this.prisma.loginSession
        .updateMany({
          where: { id: oldSessionId },
          data: { isActive: false },
        })
        .catch((err) =>
          console.error('[Auth] Failed to revoke old session', err),
        );
    }

    const payload = { userId, email };
    // BUG-004: Consistently apply expiresIn for access tokens
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: `${accessLifetimeHours}h`,
    });

    const refreshToken = await this.jwt.signAsync(
      {
        userId,
        email,
        type: 'refresh',
        ...(session.id && { sessionId: session.id }),
      },
      { expiresIn: `${refreshLifetimeDays}d` },
    );

    const tokenExpiry = this.tokenExpiryISO(accessLifetimeHours);

    return {
      accessToken,
      refreshToken,
      tokenExpiry,
    };
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
        // dateOfBirth: true, // Commented out - column doesn't exist in current DB
        mustChangePassword: true,
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

    // Optional bootstrap: grant synthetic admin only when explicitly enabled
    const bootstrapRole =
      this.config.get<string>('auth.bootstrapAdmin.roleName') || 'admin';
    if (
      !transformedRoles.length &&
      (this.config.get<boolean>('auth.bootstrapAdmin.enabled') ||
        process.env.NODE_ENV !== 'production')
    ) {
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
          name: bootstrapRole,
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
      // dateOfBirth: u.dateOfBirth || undefined, // Commented out - column doesn't exist in current DB
      mustChangePassword: (u as any).mustChangePassword ?? false,
      roles: transformedRoles,
    };
  }

  async login(dto: LoginDto) {
    try {
      const email = (dto.email || '').trim().toLowerCase();
      const password = (dto.password || '').trim();
      console.log('[Auth] Login attempt for', email);
      let user = await this.prisma.user
        .findUnique({ where: { email } })
        .catch((e) => {
          console.error('[Auth] DB error fetching user', e);
          return null;
        });
      if (!user) {
        console.warn('[Auth] User not found for email', email);

        // Bootstrap helper: auto-create admin user for default credentials
        // - Always active in non-production
        // - In production, only when BOOTSTRAP_ADMIN === 'true'
        const bootstrapConfig = this.config.get('auth.bootstrapAdmin');
        const defaultEmail = bootstrapConfig.email;
        const defaultPassword = bootstrapConfig.password;
        const defaultRole = bootstrapConfig.roleName;

        if (
          (process.env.NODE_ENV !== 'production' || bootstrapConfig.enabled) &&
          (email === defaultEmail || email === 'admin@weconnect.com') &&
          password === defaultPassword
        ) {
          console.log('[Auth] Auto-creating admin user via bootstrap helper');
          const hashed = await bcrypt.hash(password, 10);
          const created = await this.prisma.user.create({
            data: {
              email,
              password: hashed,
              firstName: 'Admin',
              lastName: 'User',
              isActive: true,
              emailVerified: true,
              // dateOfBirth: undefined, // Commented out - column doesn't exist in current DB
              // mustChangePassword: false, // Commented out - column doesn't exist in current DB
            },
          });
          // Ensure Admin role exists and assign
          let adminRole = await this.prisma.role.findUnique({
            where: { name: defaultRole },
          });
          if (!adminRole) {
            adminRole = await this.prisma.role.create({
              data: {
                name: defaultRole,
                description: 'Administrator role with full access',
                isActive: true,
                accessScope: 'GLOBAL',
              },
            });
          }
          await this.prisma.userRole.upsert({
            where: {
              userId_roleId: { userId: created.id, roleId: adminRole.id },
            },
            update: {},
            create: { userId: created.id, roleId: adminRole.id },
          });
          console.log('[Auth] Admin user created with id', created.id);
          // continue flow with newly created user
          user = created as any;
        } else {
          // No user found for this email and auto-creation not applicable
          throw new HttpException(
            'User not registered for this email. Please contact your administrator.',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      if (!user) {
        console.error('[Auth] Unexpected null user before password check');
        throw new HttpException(
          'User not registered for this email. Please contact your administrator.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // First try bcrypt comparison with the trimmed password
      let ok = await bcrypt.compare(password, user.password).catch((e) => {
        console.error('[Auth] Bcrypt compare failed', e);
        return false;
      });

      // Backward compatibility: if the stored password doesn't look like a bcrypt hash
      // and the plain text matches, treat it as a valid legacy password and upgrade it
      if (!ok) {
        const looksLikeBcrypt =
          typeof user.password === 'string' && user.password.startsWith('$2');
        if (!looksLikeBcrypt && user.password === password) {
          console.warn(
            '[Auth] Legacy plain-text password detected for',
            email,
            '- upgrading hash',
          );
          ok = true;
          try {
            const upgraded = await bcrypt.hash(password, 10);
            await this.prisma.user.update({
              where: { id: user.id },
              data: { password: upgraded },
            });
          } catch (upgradeErr) {
            console.error(
              '[Auth] Failed to upgrade legacy password hash for',
              email,
              upgradeErr,
            );
          }
        }
      }

      if (!ok) {
        console.warn('[Auth] Password mismatch for', dto.email);
        throw new HttpException(
          'Incorrect password. Please try again.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // -------------------------------------------------------
      // BLOCK LOGIN IF USER IS INACTIVE
      // -------------------------------------------------------
      if (!user.isActive) {
        throw new (require('@nestjs/common').HttpException)(
          {
            message:
              'Your login is blocked. Please contact your administrator.',
            code: 'ACCOUNT_BLOCKED',
          },
          403,
        );
      }

      // -------------------------------------------------------
      // BLOCK LOGIN IF USER'S ROLE IS INACTIVE
      // -------------------------------------------------------
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true },
      });

      // If user has roles and any role is inactive -> block login
      if (userRoles.length > 0) {
        const inactiveRole = userRoles.find(
          (ur) => ur.role && ur.role.isActive === false,
        );

        if (inactiveRole) {
          throw new HttpException(
            'Your role is inactive. Please contact your administrator.',
            HttpStatus.FORBIDDEN,
          );
        }
      }

      // BUG-005: Enforce single active session per user (Rotation/Cleanup)
      await this.prisma.loginSession.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });

      const { accessToken, refreshToken, tokenExpiry } =
        await this.generateAuthTokens(user.id, user.email);
      console.log('[Auth] Login success for', dto.email, 'userId=', user.id);

      // Refresh tokens are now handled statelessly via JWT; no DB storage required.

      // Update last login timestamp (best-effort)
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      } catch (e) {
        console.error('[Auth] Failed to update lastLogin (non-fatal)', e);
      }

      // Update FCM token if provided (for push notifications)
      if (dto.fcm) {
        try {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { fcmToken: dto.fcm },
          });
          console.log('[Auth] FCM token updated for user', user.id);
        } catch (e) {
          console.error('[Auth] Failed to update FCM token (non-fatal)', e);
        }
      }

      // Log Login Activity
      try {
        await this.activitiesService.create({
          title: 'User Login',
          description: `${user.firstName} ${user.lastName} logged in successfully`,
          type: 'USER_LOGIN', // Matches the LOGIN type mapping in activities service
          userId: user.id,
          icon: 'LogIn',
          iconColor: 'text-green-500',
        });
      } catch (e) {
        console.error('[Auth] Failed to log login activity (non-fatal)', e);
      }

      const enrichedUser = await this.buildUserWithRoles(user.id);

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          tokenExpiry,
          user: {
            ...enrichedUser,
            mustChangePassword: user.mustChangePassword,
          },
        },
      };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      if (err instanceof HttpException) throw err;
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password.trim(), 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    const enrichedUser = await this.buildUserWithRoles(user.id);
    return { success: true, data: { user: enrichedUser } };
  }

  async refreshToken(dto: RefreshDto) {
    try {
      // Verify JWT refresh token statelessly
      // Verify JWT refresh token statelessly first
      const decoded = await this.jwt
        .verifyAsync(dto.refreshToken)
        .catch(() => null);
      if (!decoded || decoded.type !== 'refresh' || !decoded.sessionId) {
        throw new HttpException(
          'Invalid or expired refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // BUG-005: Validate session effectively in DB (Rotation logic)
      const session = await this.prisma.loginSession.findUnique({
        where: { id: decoded.sessionId },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        console.warn(
          `[Auth] Blocked refresh attempt for inactive/expired session ${decoded.sessionId}`,
        );
        throw new HttpException(
          'Session expired or revoked',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Rotate: create new tokens and revoke current session
      const { accessToken, refreshToken, tokenExpiry } =
        await this.generateAuthTokens(
          decoded.userId,
          decoded.email,
          session.id,
        );

      return {
        success: true,
        data: { accessToken, refreshToken, tokenExpiry },
      };
    } catch (err) {
      console.error('[Auth] Refresh token error:', err);
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Could not refresh token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const decoded = await this.jwt
          .verifyAsync(refreshToken)
          .catch(() => null);
        if (decoded?.sessionId) {
          await this.prisma.loginSession.updateMany({
            where: { id: decoded.sessionId },
            data: { isActive: false },
          });
          console.log(`[Auth] Logged out session ${decoded.sessionId}`);
        }
      } catch (e) {
        console.error('[Auth] Logout revocation failed', e);
      }
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async profile(userId: number) {
    try {
      const user = await this.buildUserWithRoles(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: { user } };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Failed to load profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
