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
const permission_util_1 = require("../../common/utils/permission.util");
let FilesService = class FilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ entityType, entityId, }, user) {
        const where = { deletedAt: null };
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['uploadedBy']);
            if (Object.keys(roleBasedWhere).length > 0) {
                if (where.AND) {
                    where.AND.push(roleBasedWhere);
                }
                else {
                    where.AND = [roleBasedWhere];
                }
            }
        }
        const files = await this.prisma.file.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { files, items: files } };
    }
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma, ['uploadedBy']);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        return this.prisma.file.findFirst({ where });
    }
    async upload({ file, entityType, entityId, uploadedBy, name, }) {
        const saved = await this.prisma.file.create({
            data: {
                name: name || file?.originalname || 'file',
                fileName: file?.filename || file?.originalname || 'file.bin',
                filePath: `/uploads/${file?.filename || file?.originalname || 'file.bin'}`,
                fileSize: file?.size || 0,
                mimeType: file?.mimetype || 'application/octet-stream',
                entityType,
                entityId,
                uploadedBy,
            },
        });
        if (entityType === 'lead' && entityId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'File uploaded',
                        description: `File "${saved.name}" uploaded (${(saved.fileSize / 1024).toFixed(2)} KB)`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'FileText',
                        iconColor: '#3B82F6',
                        metadata: {
                            fileId: saved.id,
                            fileName: saved.name,
                            fileSize: saved.fileSize,
                            mimeType: saved.mimeType,
                        },
                        userId: uploadedBy,
                        leadId: entityId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating file upload activity:', error);
            }
        }
        return { success: true, data: { file: saved } };
    }
    async remove(id) {
        const file = await this.prisma.file.findFirst({ where: { id } });
        if (!file)
            return { success: false, message: 'File not found' };
        await this.prisma.file.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        if (file.entityType === 'lead' && file.entityId) {
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'File deleted',
                        description: `File "${file.name}" deleted`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'Trash2',
                        iconColor: '#EF4444',
                        metadata: {
                            fileId: file.id,
                            fileName: file.name,
                        },
                        userId: file.uploadedBy,
                        leadId: file.entityId,
                    },
                });
            }
            catch (error) {
                console.error('Error creating file delete activity:', error);
            }
        }
        return { success: true };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map