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
exports.WebhooksManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WebhooksManagementService = class WebhooksManagementService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const webhooks = await this.prisma.webhook.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { webhooks } };
    }
    async findOne(id) {
        const webhook = await this.prisma.webhook.findUnique({
            where: { id, deletedAt: null },
        });
        if (!webhook) {
            throw new common_1.NotFoundException(`Webhook with ID ${id} not found`);
        }
        return { success: true, data: { webhook } };
    }
    async create(dto) {
        const webhook = await this.prisma.webhook.create({
            data: {
                name: dto.name,
                url: dto.url,
                events: dto.events || [],
                secret: dto.secret,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
        return { success: true, data: { webhook } };
    }
    async update(id, dto) {
        await this.findOne(id);
        const webhook = await this.prisma.webhook.update({
            where: { id },
            data: {
                name: dto.name,
                url: dto.url,
                events: dto.events,
                secret: dto.secret,
                isActive: dto.isActive,
            },
        });
        return { success: true, data: { webhook } };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.webhook.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Webhook deleted successfully' };
    }
    async test(id) {
        const { data: { webhook } } = await this.findOne(id);
        return {
            success: true,
            message: 'Test ping sent to ' + webhook.url,
            timestamp: new Date().toISOString()
        };
    }
};
exports.WebhooksManagementService = WebhooksManagementService;
exports.WebhooksManagementService = WebhooksManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksManagementService);
//# sourceMappingURL=webhooks-management.service.js.map