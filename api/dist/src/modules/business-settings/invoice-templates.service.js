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
exports.InvoiceTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let InvoiceTemplatesService = class InvoiceTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedDefaults();
    }
    async seedDefaults() {
        const count = await this.prisma.invoiceTemplate.count();
        if (count > 0) {
            const first = await this.prisma.invoiceTemplate.findFirst();
            if (first && first.designType !== 'job_card') {
                await this.prisma.invoiceTemplate.deleteMany({});
            }
        }
        const newCount = await this.prisma.invoiceTemplate.count();
        if (newCount === 0) {
            const defaults = [
                {
                    name: 'Professional Invoice',
                    description: 'Clean modern layout with logo left, invoice details right.',
                    designType: 'professional',
                    isDefault: true,
                    primaryColor: '#EA580C',
                    secondaryColor: '#FFF7ED',
                },
                {
                    name: 'Blue Theme',
                    description: 'Professional Job Card layout in Blue.',
                    designType: 'job_card',
                    isDefault: false,
                    primaryColor: '#2563EB',
                    secondaryColor: '#DBEAFE',
                },
                {
                    name: 'Red Theme',
                    description: 'Professional Job Card layout in Red.',
                    designType: 'job_card',
                    isDefault: false,
                    primaryColor: '#DC2626',
                    secondaryColor: '#FEE2E2',
                },
                {
                    name: 'Green Theme',
                    description: 'Professional Job Card layout in Green.',
                    designType: 'job_card',
                    isDefault: false,
                    primaryColor: '#16A34A',
                    secondaryColor: '#DCFCE7',
                },
                {
                    name: 'Orange Theme',
                    description: 'Professional Job Card layout in Orange.',
                    designType: 'job_card',
                    isDefault: false,
                    primaryColor: '#EA580C',
                    secondaryColor: '#FFEDD5',
                },
                {
                    name: 'Purple Theme',
                    description: 'Professional Job Card layout in Purple.',
                    designType: 'job_card',
                    isDefault: false,
                    primaryColor: '#9333EA',
                    secondaryColor: '#F3E8FF',
                },
            ];
            for (const template of defaults) {
                await this.prisma.invoiceTemplate.create({
                    data: {
                        ...template,
                        isActive: true,
                        headerContent: '',
                        footerContent: '',
                        termsAndConditions: 'Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.',
                    },
                });
            }
            console.log('Seeded default invoice templates (Job Card Themes)');
        }
    }
    async findAll() {
        return this.prisma.invoiceTemplate.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.invoiceTemplate.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findDefault() {
        return this.prisma.invoiceTemplate.findFirst({
            where: { isDefault: true, deletedAt: null },
        });
    }
    async create(data) {
        if (data.isDefault) {
            await this.prisma.invoiceTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.invoiceTemplate.create({
            data,
        });
    }
    async update(id, data) {
        if (data.isDefault) {
            await this.prisma.invoiceTemplate.updateMany({
                where: { id: { not: id }, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.invoiceTemplate.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.invoiceTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async setDefault(id) {
        await this.prisma.$transaction([
            this.prisma.invoiceTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            }),
            this.prisma.invoiceTemplate.update({
                where: { id },
                data: { isDefault: true },
            }),
        ]);
        return { success: true };
    }
};
exports.InvoiceTemplatesService = InvoiceTemplatesService;
exports.InvoiceTemplatesService = InvoiceTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceTemplatesService);
//# sourceMappingURL=invoice-templates.service.js.map