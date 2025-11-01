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
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let IntegrationsService = class IntegrationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const items = await this.prisma.thirdPartyIntegration.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async create(dto) {
        const item = await this.prisma.thirdPartyIntegration.create({
            data: {
                name: dto.name,
                displayName: dto.displayName,
                description: dto.description ?? null,
                isActive: dto.isActive ?? true,
                apiEndpoint: dto.apiEndpoint,
                authType: dto.authType ?? 'API_KEY',
                config: dto.config ?? undefined,
            },
        });
        return { success: true, data: { integration: item } };
    }
    async update(id, dto) {
        const item = await this.prisma.thirdPartyIntegration.update({
            where: { id },
            data: {
                displayName: dto.displayName,
                description: dto.description,
                isActive: dto.isActive,
                apiEndpoint: dto.apiEndpoint,
                authType: dto.authType,
                config: dto.config,
                updatedAt: new Date(),
            },
        });
        return { success: true, data: { integration: item } };
    }
    async logs(integrationId) {
        const items = await this.prisma.integrationLog.findMany({
            where: { integrationId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map