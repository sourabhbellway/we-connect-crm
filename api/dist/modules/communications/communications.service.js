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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CommunicationsService = class CommunicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listLeadComms(leadId) {
        const items = await this.prisma.leadCommunication.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async createLeadComm(dto) {
        const comm = await this.prisma.leadCommunication.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId,
                type: dto.type,
                subject: dto.subject ?? null,
                content: dto.content,
                direction: dto.direction ?? 'outbound',
                duration: dto.duration ?? null,
                outcome: dto.outcome ?? null,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
                completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
            },
        });
        return { success: true, data: { communication: comm } };
    }
    async listTemplates({ type, active, page = 1, limit = 10, }) {
        const where = { deletedAt: null };
        if (type)
            where.type = type;
        if (active !== undefined)
            where.isActive = active === 'true';
        const [templates, total] = await Promise.all([
            this.prisma.communicationTemplate.findMany({
                where,
                include: {
                    createdByUser: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.communicationTemplate.count({ where }),
        ]);
        return {
            success: true,
            data: {
                templates,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        };
    }
    async createTemplate(dto) {
        if (dto.isDefault) {
            await this.prisma.communicationTemplate.updateMany({
                where: { type: dto.type, isDefault: true },
                data: { isDefault: false },
            });
        }
        const template = await this.prisma.communicationTemplate.create({
            data: {
                name: dto.name,
                type: dto.type,
                subject: dto.subject ?? null,
                content: dto.content,
                variables: dto.variables ?? undefined,
                isDefault: dto.isDefault ?? false,
                createdBy: dto.createdBy ?? 1,
            },
            include: {
                createdByUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        return {
            success: true,
            message: 'Template created successfully',
            data: { template },
        };
    }
    async updateTemplate(id, dto) {
        if (dto.isDefault) {
            const existing = await this.prisma.communicationTemplate.findUnique({
                where: { id },
            });
            if (existing) {
                await this.prisma.communicationTemplate.updateMany({
                    where: { type: existing.type, isDefault: true, id: { not: id } },
                    data: { isDefault: false },
                });
            }
        }
        const template = await this.prisma.communicationTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                subject: dto.subject,
                content: dto.content,
                variables: dto.variables,
                isActive: dto.isActive,
                isDefault: dto.isDefault,
                updatedAt: new Date(),
            },
            include: {
                createdByUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        return {
            success: true,
            message: 'Template updated successfully',
            data: { template },
        };
    }
    async deleteTemplate(id) {
        await this.prisma.communicationTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Template deleted successfully' };
    }
    async sendEmail(dto) {
        const message = await this.prisma.communicationMessage.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId ?? 1,
                templateId: dto.templateId ?? null,
                type: 'EMAIL',
                recipient: dto.to,
                subject: dto.subject,
                content: dto.content,
                status: 'SENT',
                sentAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'Email sent successfully',
            data: { messageId: message.id },
        };
    }
    async sendWhatsApp(dto) {
        const message = await this.prisma.communicationMessage.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId ?? 1,
                templateId: dto.templateId ?? null,
                type: 'WHATSAPP',
                recipient: dto.to,
                content: dto.content,
                status: 'SENT',
                sentAt: new Date(),
                metadata: (dto.mediaUrls
                    ? { mediaUrls: dto.mediaUrls }
                    : undefined),
            },
        });
        return {
            success: true,
            message: 'WhatsApp message sent successfully',
            data: { messageId: message.id },
        };
    }
    applyVariables(content, variables) {
        if (!variables)
            return content;
        let out = content;
        for (const [k, v] of Object.entries(variables)) {
            out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        }
        return out;
    }
    async sendTemplated(dto) {
        const template = await this.prisma.communicationTemplate.findUnique({
            where: { id: dto.templateId },
        });
        if (!template)
            return { success: false, message: 'Template not found' };
        const content = this.applyVariables(template.content, dto.variables);
        if (template.type === 'EMAIL') {
            return this.sendEmail({
                leadId: dto.leadId,
                to: '',
                subject: template.subject || 'Message',
                content,
                templateId: template.id,
                userId: dto.userId,
            });
        }
        if (template.type === 'WHATSAPP') {
            return this.sendWhatsApp({
                leadId: dto.leadId,
                to: '',
                content,
                templateId: template.id,
                userId: dto.userId,
            });
        }
        return {
            success: false,
            message: `Template type ${template.type} not supported`,
        };
    }
    async listMessages({ leadId, type, status, page = 1, limit = 10, }) {
        const where = {};
        if (leadId)
            where.leadId = leadId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        const [messages, total] = await Promise.all([
            this.prisma.communicationMessage.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    user: { select: { id: true, firstName: true, lastName: true } },
                    template: { select: { id: true, name: true, type: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.communicationMessage.count({ where }),
        ]);
        return {
            success: true,
            data: {
                messages,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        };
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map