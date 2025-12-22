"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const email_templates_1 = require("./email-templates");
const business_settings_service_1 = require("../business-settings/business-settings.service");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    businessSettingsService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, businessSettingsService) {
        this.prisma = prisma;
        this.businessSettingsService = businessSettingsService;
    }
    renderTemplate(template, data) {
        let result = template;
        result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
        result = result.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? "");
        return result;
    }
    async mapUser(u) {
        if (!u)
            return null;
        const roles = (u.roles || []).map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: (ur.role.permissions || []).map((rp) => ({
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
    async findAll({ page, limit, search, status, isDeleted, } = {}) {
        if (page !== undefined && limit !== undefined) {
            const pageNum = Math.max(1, Number(page) || 1);
            const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
            const where = {};
            if (isDeleted === true) {
                where.deletedAt = { not: null };
            }
            else if (isDeleted === false || isDeleted === undefined) {
                where.deletedAt = null;
            }
            if (status && String(status).toLowerCase().trim() === 'active') {
                where.isActive = true;
            }
            else if (status && String(status).toLowerCase().trim() === 'inactive') {
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
        const where = { deletedAt: null };
        if (status && String(status).toLowerCase().trim() === 'active') {
            where.isActive = true;
        }
        else if (status && String(status).toLowerCase().trim() === 'inactive') {
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
    async findOne(id) {
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
        if (!u)
            return { success: false, message: 'User not found' };
        return { success: true, data: await this.mapUser(u) };
    }
    async assignRoles(userId, roleIds) {
        await this.prisma.userRole.deleteMany({ where: { userId } });
        if (roleIds?.length) {
            await this.prisma.userRole.createMany({
                data: roleIds.map((roleId) => ({ userId, roleId })),
            });
        }
        return { success: true };
    }
    generateRandomPassword() {
        const length = 12;
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
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
        for (let i = picks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [picks[i], picks[j]] = [picks[j], picks[i]];
        }
        return picks.join('');
    }
    async sendEmail(to, template, data) {
        let host;
        let port;
        let user;
        let pass;
        let from;
        let fromName;
        const appName = process.env.APP_NAME || 'WeConnect CRM';
        try {
            const provider = await this.prisma.communicationProvider.findFirst({
                where: { type: 'EMAIL', isActive: true, isDefault: true },
            });
            if (provider) {
                const cfg = provider.config || {};
                this.logger.log(`Loading SMTP config from Communication Provider: ${provider.name} (ID: ${provider.id})`);
                host = cfg.smtpHost || cfg.host || cfg.EMAIL_HOST;
                port = cfg.smtpPort ? Number(cfg.smtpPort) : (cfg.port ? Number(cfg.port) : (cfg.EMAIL_PORT ? Number(cfg.EMAIL_PORT) : 587));
                user = cfg.smtpUser || cfg.username || cfg.EMAIL_HOST_USER || cfg.user;
                pass = cfg.smtpPassword || cfg.password || cfg.EMAIL_HOST_PASSWORD || cfg.pass;
                from = cfg.fromEmail || cfg.from || cfg.smtpUser || cfg.EMAIL_FROM || user;
                fromName = cfg.fromName || cfg.from_name;
                this.logger.log(`SMTP Config loaded - Host: ${host ? '✓' : '✗'}, Port: ${port}, User: ${user ? '✓' : '✗'}, From: ${from ? '✓' : '✗'}`);
                if (host && user && pass && from) {
                    this.logger.log(`Using SMTP configuration from Communication Provider: ${provider.name}`);
                }
                else {
                    this.logger.warn(`Communication Provider config incomplete. Missing: ${!host ? 'host ' : ''}${!user ? 'user ' : ''}${!pass ? 'password ' : ''}${!from ? 'from ' : ''}`);
                }
            }
            else {
                this.logger.log('No active default EMAIL provider found in Communication Providers');
            }
        }
        catch (err) {
            this.logger.error('Failed to load email provider from communication_providers', err?.stack || err);
        }
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
            return null;
        }
        const nodemailer = require('nodemailer');
        const useTLS = process.env.EMAIL_USE_TLS === 'True' || process.env.EMAIL_USE_TLS === 'true' ||
            process.env.EMAIL_USE_TLS === '1' ||
            (process.env.EMAIL_USE_TLS === undefined && (port ?? 587) !== 465);
        const transporter = nodemailer.createTransport({
            host,
            port: port ?? 587,
            secure: (port ?? 587) === 465,
            auth: { user, pass },
            tls: {
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
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error?.message || error}`, error?.stack || error);
            return null;
        }
    }
    async create(dto) {
        if (!dto.roleIds || dto.roleIds.length === 0) {
            throw new common_1.BadRequestException('At least one role must be selected');
        }
        const uniqueRoleIds = Array.from(new Set(dto.roleIds));
        const rolesCount = await this.prisma.role.count({
            where: { id: { in: uniqueRoleIds }, deletedAt: null },
        });
        if (rolesCount !== uniqueRoleIds.length) {
            throw new common_1.BadRequestException('One or more selected roles are invalid or inactive');
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
            let emailSent = false;
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
                    }
                    else {
                        this.logger.warn(`Database template email send returned null, will try fallback for ${user.email}`);
                    }
                }
                else {
                    this.logger.warn(`Database template incomplete or missing, using fallback template for ${user.email}`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to fetch or send database welcome email template to ${user.email}: ${error?.message || error}`, error?.stack);
            }
            if (!emailSent) {
                try {
                    this.logger.log(`Attempting to send fallback welcome email to ${user.email}`);
                    const result = await this.sendEmail(user.email, email_templates_1.EmailTemplates.WELCOME_NEW_USER, {
                        firstName: user.firstName,
                        email: user.email,
                        password: rawPassword,
                    });
                    if (result !== null) {
                        emailSent = true;
                        this.logger.log(`Fallback welcome email sent successfully to ${user.email}`);
                    }
                    else {
                        this.logger.error(`Fallback welcome email send returned null for ${user.email}. SMTP may not be configured.`);
                    }
                }
                catch (fallbackError) {
                    this.logger.error(`Failed to send fallback welcome email to ${user.email}: ${fallbackError?.message || fallbackError}`, fallbackError?.stack);
                }
            }
            if (!emailSent) {
                this.logger.error(`CRITICAL: Welcome email could not be sent to ${user.email}. Please check SMTP configuration.`);
            }
            return { success: true, data: { user: await this.mapUser(hydratedUser) } };
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw error;
        }
    }
    async update(id, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user)
            return { success: false, message: 'User not found' };
        const data = {};
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        if (dto.managerId !== undefined)
            data.managerId = dto.managerId;
        try {
            const updated = await this.prisma.user.update({ where: { id }, data });
            if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
                const tempPassword = this.generateRandomPassword();
                const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
                await this.prisma.user.update({
                    where: { id },
                    data: { password: hashedTempPassword, mustChangePassword: true },
                });
                let emailSent = false;
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
                            password: tempPassword,
                        });
                        if (result !== null) {
                            emailSent = true;
                            this.logger.log(`Welcome email sent successfully to ${updated.email} using database template`);
                        }
                        else {
                            this.logger.warn(`Database template email send returned null, will try fallback for ${updated.email}`);
                        }
                    }
                    else {
                        this.logger.warn(`Database template incomplete or missing, using fallback template for ${updated.email}`);
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to fetch or send database welcome email template to ${updated.email}: ${error?.message || error}`, error?.stack);
                }
                if (!emailSent) {
                    try {
                        this.logger.log(`Attempting to send fallback welcome email to ${updated.email}`);
                        const result = await this.sendEmail(updated.email, email_templates_1.EmailTemplates.WELCOME_NEW_USER, {
                            firstName: updated.firstName,
                            email: updated.email,
                            password: tempPassword,
                        });
                        if (result !== null) {
                            emailSent = true;
                            this.logger.log(`Fallback welcome email sent successfully to ${updated.email}`);
                        }
                        else {
                            this.logger.error(`Fallback welcome email send returned null for ${updated.email}. SMTP may not be configured.`);
                        }
                    }
                    catch (fallbackError) {
                        this.logger.error(`Failed to send fallback welcome email to ${updated.email}: ${fallbackError?.message || fallbackError}`, fallbackError?.stack);
                    }
                }
                if (!emailSent) {
                    this.logger.error(`CRITICAL: Welcome email could not be sent to ${updated.email} after email update. Please check SMTP configuration.`);
                }
                else {
                    this.logger.log(`Welcome email sent to ${updated.email} after email update with temp password`);
                }
            }
            return { success: true, data: { user: updated } };
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw error;
        }
    }
    async updateProfile(id, dto) {
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
        if (!user)
            return { success: false, message: 'User not found' };
        const isAdmin = (user.roles || []).some((ur) => {
            const name = (ur.role?.name || '').toLowerCase();
            return name === 'admin' || name === 'super_admin' || name === 'super admin';
        });
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.email !== undefined) {
            if (!isAdmin) {
                throw new common_1.BadRequestException('Only admin users can change email address');
            }
            data.email = dto.email;
        }
        try {
            const updated = await this.prisma.user.update({ where: { id }, data });
            return { success: true, data: { user: updated } };
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.BadRequestException('Email already in use');
            }
            throw error;
        }
    }
    async changePasswordForUser(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hasLower = /[a-z]/.test(newPassword);
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
        const hasLength = newPassword.length >= 8;
        if (!hasLength) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        if (!hasLower) {
            throw new common_1.BadRequestException('Password must contain at least one lowercase letter');
        }
        if (!hasUpper) {
            throw new common_1.BadRequestException('Password must contain at least one uppercase letter');
        }
        if (!hasNumber) {
            throw new common_1.BadRequestException('Password must contain at least one number');
        }
        if (!hasSpecial) {
            throw new common_1.BadRequestException('Password must contain at least one special character');
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
    async changePasswordForNewUser(userId, newPassword) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.mustChangePassword) {
            throw new common_1.BadRequestException('Password change is not required for this user');
        }
        const hasLower = /[a-z]/.test(newPassword);
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
        const hasLength = newPassword.length >= 8;
        if (!hasLength) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        if (!hasLower) {
            throw new common_1.BadRequestException('Password must contain at least one lowercase letter');
        }
        if (!hasUpper) {
            throw new common_1.BadRequestException('Password must contain at least one uppercase letter');
        }
        if (!hasNumber) {
            throw new common_1.BadRequestException('Password must contain at least one number');
        }
        if (!hasSpecial) {
            throw new common_1.BadRequestException('Password must contain at least one special character');
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
    async updateAvatar(id, fileName) {
        const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
        if (!user)
            return { success: false, message: 'User not found' };
        const updated = await this.prisma.user.update({ where: { id }, data: { profilePicture: fileName } });
        return { success: true, data: { user: updated } };
    }
    async remove(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!user)
            return { success: false, message: 'User not found' };
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'User moved to trash' };
    }
    async restore(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: { not: null } },
        });
        if (!user)
            return { success: false, message: 'User not found in trash' };
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: null },
        });
        return { success: true, message: 'User restored successfully' };
    }
    async deletePermanently(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: { not: null } },
        });
        if (!user)
            return { success: false, message: 'User not found in trash' };
        try {
            await this.prisma.user.delete({ where: { id } });
            return { success: true, message: 'User deleted permanently' };
        }
        catch (error) {
            if (error?.code === 'P2003') {
                return {
                    success: false,
                    message: 'Unable to delete this user permanently because other records still reference it. Please detach or delete the related data first.',
                };
            }
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        business_settings_service_1.BusinessSettingsService])
], UsersService);
//# sourceMappingURL=users.service.js.map