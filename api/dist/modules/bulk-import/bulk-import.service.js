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
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let BulkImportService = class BulkImportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLeadBatch(dto) {
        const batch = await this.prisma.leadImportBatch.create({
            data: {
                fileName: dto.fileName || `leads-${Date.now()}.json`,
                totalRows: dto.records.length,
                createdBy: dto.createdBy,
                records: {
                    create: dto.records.map((raw, idx) => ({
                        rowIndex: idx,
                        rawData: raw,
                    })),
                },
            },
            include: { records: true },
        });
        return { success: true, data: { batch } };
    }
    async listBatches({ page = 1, limit = 10, }) {
        const [items, total] = await Promise.all([
            this.prisma.leadImportBatch.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.leadImportBatch.count(),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async listRecords(batchId) {
        const items = await this.prisma.leadImportRecord.findMany({
            where: { batchId },
            orderBy: { rowIndex: 'asc' },
        });
        return { success: true, data: { items } };
    }
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map