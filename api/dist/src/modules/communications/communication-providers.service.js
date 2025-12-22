"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommunicationProvidersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CommunicationProvidersService = CommunicationProvidersService_1 = class CommunicationProvidersService {
    prisma;
    logger = new common_1.Logger(CommunicationProvidersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listProviders() {
        const providers = await this.prisma.communicationProvider.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return {
            success: true,
            data: { providers },
        };
    }
    async createProvider(body) {
        const type = (body.type || 'EMAIL').toUpperCase();
        const isDefault = !!body.isDefault;
        const config = body.config || {};
        if (body.provider) {
            config.provider = body.provider;
        }
        if (isDefault) {
            await this.prisma.communicationProvider.updateMany({
                where: { type, isDefault: true },
                data: { isDefault: false },
            });
        }
        const provider = await this.prisma.communicationProvider.create({
            data: {
                name: body.name,
                type,
                config,
                isActive: body.isActive !== false,
                isDefault,
            },
        });
        return {
            success: true,
            message: 'Provider created successfully',
            data: { provider },
        };
    }
    async updateProvider(id, body) {
        const existing = await this.prisma.communicationProvider.findUnique({ where: { id } });
        if (!existing) {
            return { success: false, message: 'Provider not found' };
        }
        const type = (body.type || existing.type || 'EMAIL').toUpperCase();
        const isDefault = body.isDefault ?? existing.isDefault;
        if (isDefault) {
            await this.prisma.communicationProvider.updateMany({
                where: { type, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }
        const mergedConfig = {
            ...existing.config,
            ...(body.config || {}),
        };
        if (body.provider) {
            mergedConfig.provider = body.provider;
        }
        const provider = await this.prisma.communicationProvider.update({
            where: { id },
            data: {
                name: body.name ?? existing.name,
                type,
                config: mergedConfig,
                isActive: body.isActive ?? existing.isActive,
                isDefault,
            },
        });
        return {
            success: true,
            message: 'Provider updated successfully',
            data: { provider },
        };
    }
    async deleteProvider(id) {
        await this.prisma.communicationProvider.delete({ where: { id } });
        return { success: true, message: 'Provider deleted successfully' };
    }
    async testProvider(id, body) {
        const provider = await this.prisma.communicationProvider.findUnique({ where: { id } });
        if (!provider) {
            return { success: false, message: 'Provider not found' };
        }
        const cfg = provider.config || {};
        const recipient = body.recipient || (provider.type === 'EMAIL' ? cfg.fromEmail : undefined);
        if (!recipient) {
            return { success: false, message: 'Recipient not provided for test' };
        }
        if (provider.type === 'EMAIL') {
            const host = cfg.smtpHost || cfg.host;
            const port = cfg.smtpPort || cfg.port || 587;
            const user = cfg.smtpUser || cfg.username;
            const pass = cfg.smtpPassword || cfg.password;
            const from = cfg.fromEmail || cfg.from || user;
            const fromName = cfg.fromName;
            if (!host || !user || !pass || !from) {
                return { success: false, message: 'SMTP configuration incomplete for this provider' };
            }
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                });
                const appName = process.env.APP_NAME || 'WeConnect CRM';
                const fromHeader = fromName ? `${fromName} <${from}>` : from;
                await transporter.sendMail({
                    from: fromHeader,
                    to: recipient,
                    subject: `${appName} communication provider test`,
                    text: `This is a test email sent from ${appName} using the configured SMTP provider.`,
                });
                return { success: true, message: 'Test email sent successfully' };
            }
            catch (error) {
                this.logger.error('Test email failed', error?.stack || error);
                return { success: false, message: 'Test email failed', error: String(error?.message || error) };
            }
        }
        return {
            success: true,
            message: 'Test executed (no-op for this provider type)',
        };
    }
};
exports.CommunicationProvidersService = CommunicationProvidersService;
exports.CommunicationProvidersService = CommunicationProvidersService = CommunicationProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationProvidersService);
//# sourceMappingURL=communication-providers.service.js.map