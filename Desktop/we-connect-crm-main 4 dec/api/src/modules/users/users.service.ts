import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { EmailTemplates } from './email-templates';
import * as nodemailer from 'nodemailer';
import { BusinessSettingsService } from '../business-settings/business-settings.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businessSettingsService: BusinessSettingsService,
  ) { }

  private renderTemplate(template: string, data: Record<string, string>) {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "");
  }

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

  private generateRandomPassword(): string {
    // Generate a reasonably strong random password that satisfies default rules
    const length = 12;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Ensure at least one character from each required set
    const picks = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const all = upper + lower + numbers + symbols;
    const remainingLength = Math.max(length - picks.length, 4);
    const randomBuffer = crypto.randomBytes(remainingLength);

    for (let i = 0; i < remainingLength; i++) {
      const index = randomBuffer[i] % all.length;
      picks.push(all[index]);
    }

    // Shuffle the characters
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }

    return picks.join('');
  }

  // private async sendWelcomeEmail(to: string, rawPassword: string) {
  //   try {
  //     // Prefer business settings -> communication providers for SMTP configuration
  //     // Falls back to legacy ENV-based configuration if no provider is found
  //     let host: string | undefined;
  //     let port: number | undefined;
  //     let user: string | undefined;
  //     let pass: string | undefined;
  //     let from: string | undefined;
  //     let fromName: string | undefined;

  //     try {
  //       const provider = await this.prisma.communicationProvider.findFirst({
  //         where: {
  //           type: 'EMAIL',
  //           isActive: true,
  //           isDefault: true,
  //         },
  //       });

  //       if (provider) {
  //         const cfg = (provider as any).config || {};

  //         // For SMTP providers configured from Business Settings > Integrations > Communication
  //         if ((provider as any).name || (provider as any).type) {
  //           host = cfg.smtpHost || cfg.host;
  //           port = cfg.smtpPort || cfg.port;
  //           user = cfg.smtpUser || cfg.username;
  //           pass = cfg.smtpPassword || cfg.password;
  //           from = cfg.fromEmail || cfg.from || cfg.smtpUser;
  //           fromName = cfg.fromName;
  //         }
  //       }
  //     } catch (err) {
  //       this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
  //     }

  //     // Fallback to legacy ENV configuration if provider not configured or incomplete
  //     if (!host || !user || !pass || !from) {
  //       host = host || process.env.SMTP_HOST;
  //       port = port || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587);
  //       user = user || process.env.SMTP_USER;
  //       pass = pass || process.env.SMTP_PASS;
  //       from = from || process.env.SMTP_FROM || user;
  //     }

  //     if (!host || !user || !pass || !from) {
  //       this.logger.warn('SMTP configuration incomplete (from provider or env); skipping welcome email');
  //       return;
  //     }

  //     // Use nodemailer lazily to avoid issues if not installed
  //     // eslint-disable-next-line @typescript-eslint/no-var-requires
  //     const nodemailer = require('nodemailer');

  //     const transporter = nodemailer.createTransport({
  //       host,
  //       port: port ?? 587,
  //       secure: (port ?? 587) === 465,
  //       auth: { user, pass },
  //     });

  //     const appName = process.env.APP_NAME || 'WeConnect CRM';

  //     const fromHeader = fromName ? `${fromName} <${from}>` : from;

  //     await transporter.sendMail({
  //       from: fromHeader,
  //       to,
  //       subject: `${appName} account created`,
  //       text:
  //         `Hello,\n\n` +
  //         `An account has been created for you on ${appName}.\n\n` +
  //         `Login email: ${to}\n` +
  //         `Temporary password: ${rawPassword}\n\n` +
  //         `Please log in and change your password after first login.\n\n` +
  //         `If you did not expect this email, please contact your administrator.`,
  //     });

  //     this.logger.log(`Welcome email queued for ${to}`);
  //   } catch (error) {
  //     this.logger.error(`Failed to send welcome email to ${to}`, error.stack || error);
  //   }
  // }

  private async sendEmail(
    to: string,
    template: { subject: string; text: string; html: string },
    data: Record<string, string>
  ) {
    // Attempt to load SMTP configuration from communication_providers (preferred)
    let host: string | undefined;
    let port: number | undefined;
    let user: string | undefined;
    let pass: string | undefined;
    let from: string | undefined;
    let fromName: string | undefined;
    const appName = process.env.APP_NAME || 'WeConnect CRM';

    try {
      const provider = await this.prisma.communicationProvider.findFirst({
        where: { type: 'EMAIL', isActive: true, isDefault: true },
      });
      if (provider) {
        const cfg = (provider as any).config || {};
        host = cfg.smtpHost || cfg.host;
        port = cfg.smtpPort || cfg.port;
        user = cfg.smtpUser || cfg.username;
        pass = cfg.smtpPassword || cfg.password;
        from = cfg.fromEmail || cfg.from || cfg.smtpUser;
        fromName = cfg.fromName;
      }
    } catch (err) {
      this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
    }

    // Fallback to env variables if provider not configured or incomplete
    if (!host || !user || !pass || !from) {
      host = host || process.env.SMTP_HOST;
      port = port || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587);
      user = user || process.env.SMTP_USER;
      pass = pass || process.env.SMTP_PASS;
      from = from || process.env.SMTP_FROM || user;
    }

    if (!host || !user || !pass || !from) {
      this.logger.warn('SMTP not configured (provider or env); skipping email.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port: port ?? 587,
      secure: (port ?? 587) === 465,
      auth: { user, pass },
    });

    const subject = this.renderTemplate(template.subject, { ...data, appName });
    const text = this.renderTemplate(template.text, { ...data, appName });
    const html = this.renderTemplate(template.html, { ...data, appName });

    const fromHeader = fromName ? `${fromName} <${from}>` : from;

    try {
      await transporter.sendMail({ from: fromHeader, to, subject, text, html });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack || error);
    }
  }

  async create(dto: CreateUserDto) {
    if (!dto.roleIds || dto.roleIds.length === 0) {
      throw new BadRequestException('At least one role must be selected');
    }

    const uniqueRoleIds = Array.from(new Set(dto.roleIds));
    const rolesCount = await this.prisma.role.count({
      where: { id: { in: uniqueRoleIds }, deletedAt: null },
    });

    if (rolesCount !== uniqueRoleIds.length) {
      throw new BadRequestException('One or more selected roles are invalid or inactive');
    }

    const rawPassword = (dto.password || '').trim() || this.generateRandomPassword();
    const hashed = await bcrypt.hash(rawPassword, 10);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: dto.email.trim().toLowerCase(),
            password: hashed,
            firstName: dto.firstName,
            lastName: dto.lastName,
            managerId: dto.managerId ?? null,
            mustChangePassword: true,
          },
        });

        await tx.userRole.createMany({
          data: uniqueRoleIds.map((roleId) => ({ userId: createdUser.id, roleId })),
        });

        return createdUser;
      });

      const hydratedUser = await this.prisma.user.findFirst({
        where: { id: user.id },
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

      // Fire-and-forget welcome email; failure must not break user creation
      try {
        const welcomeTemplateResponse = await this.businessSettingsService.getWelcomeEmailTemplate();
        const template = welcomeTemplateResponse.data;
        
        if (template && template.subject && template.htmlContent && template.textContent) {
          await this.sendEmail(user.email, {
            subject: template.subject,
            text: template.textContent,
            html: template.htmlContent,
          }, {
            firstName: user.firstName,
            email: user.email,
            password: rawPassword,
          });
        } else {
          // Fallback to hardcoded template if database template is incomplete
          await this.sendEmail(user.email, EmailTemplates.WELCOME_NEW_USER, {
            firstName: user.firstName,
            email: user.email,
            password: rawPassword,
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch welcome email template from database, using fallback: ${error.message}`);
        // Fallback to hardcoded template if database call fails
        await this.sendEmail(user.email, EmailTemplates.WELCOME_NEW_USER, {
          firstName: user.firstName,
          email: user.email,
          password: rawPassword,
        });
      }

      return { success: true, data: { user: await this.mapUser(hydratedUser) } };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        // Prisma unique constraint violation (e.g. duplicate email)
        throw new BadRequestException('Email already in use');
      }

      throw error;
    }
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
  
    try {
      const updated = await this.prisma.user.update({ where: { id }, data });
  
      // Send email **if the email changed**
      if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
        try {
          const emailChangeTemplateResponse = await this.businessSettingsService.getSystemEmailTemplate('EMAIL_CHANGE_CONFIRMATION');
          const template = emailChangeTemplateResponse.data;

          if (template && template.subject && template.htmlContent && template.textContent) {
            await this.sendEmail(updated.email, {
              subject: template.subject,
              text: template.textContent,
              html: template.htmlContent,
            }, {
              firstName: updated.firstName,
              email: updated.email,
            });
          } else {
            // Fallback to hardcoded template if database template is incomplete
            await this.sendEmail(updated.email, EmailTemplates.WELCOME_UPDATED_EMAIL, {
              firstName: updated.firstName,
              email: updated.email,
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch email change template from database, using fallback: ${error.message}`);
          // Fallback to hardcoded template if database call fails
          await this.sendEmail(updated.email, EmailTemplates.WELCOME_UPDATED_EMAIL, {
            firstName: updated.firstName,
            email: updated.email,
          });
        }
        this.logger.log(`Email change notification sent to ${updated.email}`);
      }
  
      return { success: true, data: { user: updated } };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw error;
    }
  }
  


  async updateProfile(
    id: number,
    dto: { firstName?: string; lastName?: string; email?: string; dateOfBirth?: string | null },
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) return { success: false, message: 'User not found' };

    const isAdmin = (user.roles || []).some((ur: any) => {
      const name = (ur.role?.name || '').toLowerCase();
      return name === 'admin' || name === 'super_admin' || name === 'super admin';
    });

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;

    if (dto.email !== undefined) {
      if (!isAdmin) {
        throw new BadRequestException('Only admin users can change email address');
      }
      data.email = dto.email;
    }

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

    try {
      const updated = await this.prisma.user.update({ where: { id }, data });
      return { success: true, data: { user: updated } };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }

      throw error;
    }
  }

  async changePasswordForUser(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Strong password rules (same as user creation UI):
    // - at least 8 characters
    // - at least one lowercase, one uppercase, one number, one special symbol
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const hasLength = newPassword.length >= 8;

    if (!hasLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!hasLower) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!hasUpper) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!hasNumber) {
      throw new BadRequestException('Password must contain at least one number');
    }
    if (!hasSpecial) {
      throw new BadRequestException('Password must contain at least one special character');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        mustChangePassword: false,
        failedLoginAttempts: 0,
      },
    });

    await this.prisma.passwordHistory.create({
      data: {
        userId: userId,
        password: hashed,
      },
    });

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

  async deletePermanently(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!user) return { success: false, message: 'User not found in trash' };

    try {
      await this.prisma.user.delete({ where: { id } });
      return { success: true, message: 'User deleted permanently' };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        return {
          success: false,
          message:
            'Unable to delete this user permanently because other records still reference it. Please detach or delete the related data first.',
        };
      }
      throw error;
    }
  }
}
