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
    // Support both {{variable}} and {variable} formats
    let result = template;
    // First replace {{variable}} format
    result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
    // Then replace {variable} format for backward compatibility
    result = result.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "");
    return result;
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
      managerId: u.managerId ?? undefined,
      manager,
      teamId: u.teamId ?? undefined,
      team: u.team ? { id: u.team.id, name: u.team.name } : null,
      teamSize: u._count?.subordinates ?? 0,
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
            _count: { select: { subordinates: true } },
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
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        team: { select: { id: true, name: true } },
        _count: { select: { subordinates: true } },
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
        this.logger.log(`Loading SMTP config from Communication Provider: ${provider.name} (ID: ${provider.id})`);

        // Try multiple field name variations to support different config formats
        host = cfg.smtpHost || cfg.host || cfg.EMAIL_HOST;
        port = cfg.smtpPort ? Number(cfg.smtpPort) : (cfg.port ? Number(cfg.port) : (cfg.EMAIL_PORT ? Number(cfg.EMAIL_PORT) : 587));
        user = cfg.smtpUser || cfg.username || cfg.EMAIL_HOST_USER || cfg.user;
        pass = cfg.smtpPassword || cfg.password || cfg.EMAIL_HOST_PASSWORD || cfg.pass;
        from = cfg.fromEmail || cfg.from || cfg.smtpUser || cfg.EMAIL_FROM || user;
        fromName = cfg.fromName || cfg.from_name;

        this.logger.log(`SMTP Config loaded - Host: ${host ? '✓' : '✗'}, Port: ${port}, User: ${user ? '✓' : '✗'}, From: ${from ? '✓' : '✗'}`);

        if (host && user && pass && from) {
          this.logger.log(`Using SMTP configuration from Communication Provider: ${provider.name}`);
        } else {
          this.logger.warn(`Communication Provider config incomplete. Missing: ${!host ? 'host ' : ''}${!user ? 'user ' : ''}${!pass ? 'password ' : ''}${!from ? 'from ' : ''}`);
        }
      } else {
        this.logger.log('No active default EMAIL provider found in Communication Providers');
      }
    } catch (err) {
      this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
    }

    // Fallback to env variables if provider not configured or incomplete
    // Support both EMAIL_* and SMTP_* environment variable formats
    if (!host || !user || !pass || !from) {
      host = host || process.env.EMAIL_HOST || process.env.SMTP_HOST;
      port = port || (process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) :
        (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587));
      user = user || process.env.EMAIL_HOST_USER || process.env.SMTP_USER;
      pass = pass || process.env.EMAIL_HOST_PASSWORD || process.env.SMTP_PASS;
      from = from || process.env.EMAIL_FROM || process.env.SMTP_FROM || user;
    }

    if (!host || !user || !pass || !from) {
      const errorMsg = `SMTP not configured (provider or env); cannot send email to ${to}. Please configure SMTP settings in Communication Providers or environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM).`;
      this.logger.error(errorMsg);
      // Don't throw error - just log it so user creation doesn't fail
      // The caller should handle this gracefully
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');

    // Check if TLS should be used (EMAIL_USE_TLS or default to true for port 587)
    const useTLS = process.env.EMAIL_USE_TLS === 'True' || process.env.EMAIL_USE_TLS === 'true' ||
      process.env.EMAIL_USE_TLS === '1' ||
      (process.env.EMAIL_USE_TLS === undefined && (port ?? 587) !== 465);

    const transporter = nodemailer.createTransport({
      host,
      port: port ?? 587,
      secure: (port ?? 587) === 465, // true for 465, false for other ports
      auth: { user, pass },
      tls: {
        // Do not fail on invalid certs (useful for self-signed certificates)
        rejectUnauthorized: false
      }
    });

    const subject = this.renderTemplate(template.subject, { ...data, appName });
    const text = this.renderTemplate(template.text, { ...data, appName });
    const html = this.renderTemplate(template.html, { ...data, appName });

    const fromHeader = fromName ? `${fromName} <${from}>` : from;

    try {
      this.logger.log(`Sending email to ${to} from ${fromHeader}`);
      const result = await transporter.sendMail({ from: fromHeader, to, subject, text, html });
      this.logger.log(`Email sent successfully to ${to}. MessageId: ${result.messageId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message || error}`, error?.stack || error);
      // Don't throw - log error but don't break user creation
      return null;
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
      // GUARANTEE: Email will be sent using fallback template if database template fails
      let emailSent = false;

      // Try to get database template first
      try {
        this.logger.log(`Attempting to send welcome email to ${user.email}`);
        const welcomeTemplateResponse = await this.businessSettingsService.getWelcomeEmailTemplate();
        const template = welcomeTemplateResponse?.data;

        if (template && template.subject && template.htmlContent && template.textContent) {
          this.logger.log(`Using database welcome email template for ${user.email}`);
          this.logger.log(`Template variables being sent: firstName=${user.firstName}, email=${user.email}, password=${rawPassword ? '[SET]' : '[NOT SET]'}`);
          const result = await this.sendEmail(user.email, {
            subject: template.subject,
            text: template.textContent,
            html: template.htmlContent,
          }, {
            firstName: user.firstName,
            email: user.email,
            password: rawPassword,
          });

          if (result !== null) {
            emailSent = true;
            this.logger.log(`Welcome email sent successfully to ${user.email} using database template`);
          } else {
            this.logger.warn(`Database template email send returned null, will try fallback for ${user.email}`);
          }
        } else {
          this.logger.warn(`Database template incomplete or missing, using fallback template for ${user.email}`);
        }
      } catch (error: any) {
        this.logger.error(`Failed to fetch or send database welcome email template to ${user.email}: ${error?.message || error}`, error?.stack);
      }

      // ALWAYS try fallback template if database template didn't work
      if (!emailSent) {
        try {
          this.logger.log(`Attempting to send fallback welcome email to ${user.email}`);
          const result = await this.sendEmail(user.email, EmailTemplates.WELCOME_NEW_USER, {
            firstName: user.firstName,
            email: user.email,
            password: rawPassword,
          });

          if (result !== null) {
            emailSent = true;
            this.logger.log(`Fallback welcome email sent successfully to ${user.email}`);
          } else {
            this.logger.error(`Fallback welcome email send returned null for ${user.email}. SMTP may not be configured.`);
          }
        } catch (fallbackError: any) {
          this.logger.error(`Failed to send fallback welcome email to ${user.email}: ${fallbackError?.message || fallbackError}`, fallbackError?.stack);
        }
      }

      if (!emailSent) {
        this.logger.error(`CRITICAL: Welcome email could not be sent to ${user.email}. Please check SMTP configuration.`);
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

      // Send welcome email **if the email changed** (as per requirement: welcome email on email update)
      // Same welcome email template as user creation, with new temp password and email
      // GUARANTEE: Email will be sent using fallback template if database template fails
      if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
        // Generate new temporary password for email update (same method as user creation)
        const tempPassword = this.generateRandomPassword();
        const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

        // Update user password with new temp password
        await this.prisma.user.update({
          where: { id },
          data: { password: hashedTempPassword, mustChangePassword: true },
        });

        let emailSent = false;

        // Try to get database template first
        try {
          this.logger.log(`Attempting to send welcome email to ${updated.email} after email update`);
          const welcomeTemplateResponse = await this.businessSettingsService.getWelcomeEmailTemplate();
          const template = welcomeTemplateResponse?.data;

          if (template && template.subject && template.htmlContent && template.textContent) {
            this.logger.log(`Using database welcome email template for ${updated.email}`);
            const result = await this.sendEmail(updated.email, {
              subject: template.subject,
              text: template.textContent,
              html: template.htmlContent,
            }, {
              firstName: updated.firstName,
              email: updated.email,
              password: tempPassword, // Include temp password in welcome email (same as creation)
            });

            if (result !== null) {
              emailSent = true;
              this.logger.log(`Welcome email sent successfully to ${updated.email} using database template`);
            } else {
              this.logger.warn(`Database template email send returned null, will try fallback for ${updated.email}`);
            }
          } else {
            this.logger.warn(`Database template incomplete or missing, using fallback template for ${updated.email}`);
          }
        } catch (error: any) {
          this.logger.error(`Failed to fetch or send database welcome email template to ${updated.email}: ${error?.message || error}`, error?.stack);
        }

        // ALWAYS try fallback template if database template didn't work
        if (!emailSent) {
          try {
            this.logger.log(`Attempting to send fallback welcome email to ${updated.email}`);
            const result = await this.sendEmail(updated.email, EmailTemplates.WELCOME_NEW_USER, {
              firstName: updated.firstName,
              email: updated.email,
              password: tempPassword,
            });

            if (result !== null) {
              emailSent = true;
              this.logger.log(`Fallback welcome email sent successfully to ${updated.email}`);
            } else {
              this.logger.error(`Fallback welcome email send returned null for ${updated.email}. SMTP may not be configured.`);
            }
          } catch (fallbackError: any) {
            this.logger.error(`Failed to send fallback welcome email to ${updated.email}: ${fallbackError?.message || fallbackError}`, fallbackError?.stack);
          }
        }

        if (!emailSent) {
          this.logger.error(`CRITICAL: Welcome email could not be sent to ${updated.email} after email update. Please check SMTP configuration.`);
        } else {
          this.logger.log(`Welcome email sent to ${updated.email} after email update with temp password`);
        }
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
    dto: { firstName?: string; lastName?: string; email?: string },
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

  async changePasswordForNewUser(userId: number, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user actually needs to change password
    if (!user.mustChangePassword) {
      throw new BadRequestException('Password change is not required for this user');
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

