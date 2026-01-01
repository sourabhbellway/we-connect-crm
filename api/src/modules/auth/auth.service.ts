import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcryptjs';
import { ActivitiesService } from '../activities/activities.service';

const REFRESH_LIFETIME_DAYS = 7;
const ACCESS_LIFETIME_HOURS = 24;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly activitiesService: ActivitiesService,
    ) { }

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
        if (!transformedRoles.length && (process.env.BOOTSTRAP_ADMIN === 'true' || process.env.NODE_ENV !== 'production')) {
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
                if (
                    (process.env.NODE_ENV !== 'production' || process.env.BOOTSTRAP_ADMIN === 'true') &&
                    (email === 'admin@weconnect.com' || email === 'admin@weconnet.com') &&
                    password === 'admin123'
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
                    let adminRole = await this.prisma.role.findUnique({ where: { name: 'Admin' } });
                    if (!adminRole) {
                        adminRole = await this.prisma.role.create({
                            data: {
                                name: 'Admin',
                                description: 'Administrator role with full access',
                                isActive: true,
                                accessScope: 'GLOBAL',
                            },
                        });
                    }
                    await this.prisma.userRole.upsert({
                        where: { userId_roleId: { userId: created.id, roleId: adminRole.id } },
                        update: {},
                        create: { userId: created.id, roleId: adminRole.id },
                    });
                    console.log('[Auth] Admin user created with id', created.id);
                    // continue flow with newly created user
                    user = created as any;
                } else {
                    // No user found for this email
                    return {
                        success: false,
                        message: 'User not registered for this email. Please contact your administrator.',
                    };
                }
            }

            if (!user) {
                console.error('[Auth] Unexpected null user before password check');
                return {
                    success: false,
                    message: 'User not registered for this email. Please contact your administrator.',
                };
            }

            // First try bcrypt comparison with the trimmed password
            let ok = await bcrypt.compare(password, user.password).catch((e) => {
                console.error('[Auth] Bcrypt compare failed', e);
                return false;
            });

            // Backward compatibility: if the stored password doesn't look like a bcrypt hash
            // and the plain text matches, treat it as a valid legacy password and upgrade it
            if (!ok) {
                const looksLikeBcrypt = typeof user.password === 'string' && user.password.startsWith('$2');
                if (!looksLikeBcrypt && user.password === password) {
                    console.warn('[Auth] Legacy plain-text password detected for', email, '- upgrading hash');
                    ok = true;
                    try {
                        const upgraded = await bcrypt.hash(password, 10);
                        await this.prisma.user.update({
                            where: { id: user.id },
                            data: { password: upgraded },
                        });
                    } catch (upgradeErr) {
                        console.error('[Auth] Failed to upgrade legacy password hash for', email, upgradeErr);
                    }
                }
            }

            if (!ok) {
                console.warn('[Auth] Password mismatch for', dto.email);
                return { success: false, message: 'Incorrect password. Please try again.' };
            }
            // -------------------------------------------------------
            // BLOCK LOGIN IF USER IS INACTIVE
            // -------------------------------------------------------
            if (!user.isActive) {
                throw new (require('@nestjs/common').HttpException)(
                    { message: 'Your login is blocked. Please contact your administrator.', code: 'ACCOUNT_BLOCKED' },
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
                const inactiveRole = userRoles.find((ur) => ur.role && ur.role.isActive === false);

                if (inactiveRole) {
                    return {
                        success: false,
                        message: 'Your role is inactive. Please contact your administrator.',
                    };
                }
            }



            const payload = { userId: user.id, email: user.email };
            const accessToken = await this.jwt.signAsync(payload, { expiresIn: `${ACCESS_LIFETIME_HOURS}h` });
            console.log('[Auth] Login success for', dto.email, 'userId=', user.id);

            const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);

            const refreshToken = await bcrypt.hash(`${user.id}:${Date.now()}`, 10);
            try {
                await this.prisma.refreshToken.create({
                    data: {
                        token: refreshToken,
                        userId: user.id,
                        expiresAt: new Date(
                            Date.now() + REFRESH_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
                        ),
                    },
                });
            } catch (e) {
                console.error('[Auth] Failed to persist refresh token (non-fatal)', e);
            }

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
            return { success: false, message: 'Login failed' };
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
