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
exports.BusinessSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let BusinessSettingsService = class BusinessSettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureSettings() {
        let bs = await this.prisma.businessSettings.findFirst();
        if (!bs) {
            bs = await this.prisma.businessSettings.create({
                data: { companyName: 'Your Company' },
            });
        }
        return bs;
    }
    async getCompany() {
        const bs = await this.ensureSettings();
        return {
            success: true,
            data: {
                name: bs.companyName,
                email: bs.companyEmail,
                phone: bs.companyPhone,
                address: bs.companyAddress,
                website: bs.companyWebsite,
                logo: bs.companyLogo,
            },
        };
    }
    async updateCompany(body) {
        const bs = await this.ensureSettings();
        const updated = await this.prisma.businessSettings.update({
            where: { id: bs.id },
            data: {
                companyName: body.name ?? bs.companyName,
                companyEmail: body.email ?? bs.companyEmail,
                companyPhone: body.phone ?? bs.companyPhone,
                companyAddress: body.address ?? bs.companyAddress,
                companyWebsite: body.website ?? bs.companyWebsite,
            },
        });
        return { success: true, data: updated };
    }
    async uploadLogo(file) {
        const bs = await this.ensureSettings();
        await this.prisma.businessSettings.update({
            where: { id: bs.id },
            data: { companyLogo: file?.originalname || 'logo.png' },
        });
        return {
            success: true,
            data: { logoUrl: `/uploads/${file?.filename || 'logo.png'}` },
        };
    }
    async getCurrency() {
        const bs = await this.ensureSettings();
        return { success: true, data: { currency: bs.currency } };
    }
    async updateCurrency(body) {
        const bs = await this.ensureSettings();
        const updated = await this.prisma.businessSettings.update({
            where: { id: bs.id },
            data: { currency: body.currency ?? bs.currency },
        });
        return { success: true, data: updated };
    }
    async getTax() {
        const bs = await this.ensureSettings();
        return {
            success: true,
            data: { defaultRate: bs.passwordRequireNumber ? 18 : 18 },
        };
    }
    async updateTax(body) {
        return { success: true };
    }
    async listLeadSources() {
        const items = await this.prisma.leadSource.findMany();
        return { success: true, data: items };
    }
    async createLeadSource(body) {
        const ls = await this.prisma.leadSource.create({
            data: { name: body.name, description: body.description ?? null },
        });
        return { success: true, data: ls };
    }
    async updateLeadSource(body) {
        const ls = await this.prisma.leadSource.update({
            where: { id: Number(body.id) },
            data: { name: body.name, description: body.description ?? null },
        });
        return { success: true, data: ls };
    }
};
exports.BusinessSettingsService = BusinessSettingsService;
exports.BusinessSettingsService = BusinessSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessSettingsService);
//# sourceMappingURL=business-settings.service.js.map