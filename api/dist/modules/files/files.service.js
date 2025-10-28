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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let FilesService = class FilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ entityType, entityId }) {
        const where = { deletedAt: null };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        const items = await this.prisma.file.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { success: true, data: { items } };
    }
    async upload({ file, entityType, entityId, uploadedBy, name }) {
        const saved = await this.prisma.file.create({
            data: {
                name: name || file?.originalname || 'file',
                fileName: file?.originalname || 'file.bin',
                filePath: `/uploads/${file?.filename || file?.originalname || 'file.bin'}`,
                fileSize: file?.size || 0,
                mimeType: file?.mimetype || 'application/octet-stream',
                entityType,
                entityId,
                uploadedBy,
            },
        });
        return { success: true, data: { file: saved } };
    }
    async remove(id) {
        await this.prisma.file.update({ where: { id }, data: { deletedAt: new Date() } });
        return { success: true };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map