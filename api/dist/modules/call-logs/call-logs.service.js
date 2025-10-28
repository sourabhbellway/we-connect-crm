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
exports.CallLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CallLogsService = class CallLogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ leadId, userId }) {
        const where = {};
        if (leadId)
            where.leadId = leadId;
        if (userId)
            where.userId = userId;
        const items = await this.prisma.callLog.findMany({ where, orderBy: { createdAt: 'desc' } });
        return { success: true, data: { items } };
    }
    async getById(id) {
        const item = await this.prisma.callLog.findUnique({ where: { id } });
        if (!item)
            return { success: false, message: 'Call log not found' };
        return { success: true, data: { item } };
    }
    async create(dto) {
        const item = await this.prisma.callLog.create({
            data: {
                leadId: dto.leadId,
                userId: dto.userId,
                phoneNumber: dto.phoneNumber,
                callType: dto.callType ?? 'OUTBOUND',
                callStatus: dto.callStatus ?? 'INITIATED',
                duration: dto.duration ?? null,
                startTime: dto.startTime ? new Date(dto.startTime) : null,
                endTime: dto.endTime ? new Date(dto.endTime) : null,
                notes: dto.notes ?? null,
                outcome: dto.outcome ?? null,
                recordingUrl: dto.recordingUrl ?? null,
                isAnswered: dto.isAnswered ?? false,
                metadata: dto.metadata ?? undefined,
            },
        });
        return { success: true, data: { item } };
    }
    async update(id, dto) {
        const item = await this.prisma.callLog.update({
            where: { id },
            data: {
                phoneNumber: dto.phoneNumber,
                callType: dto.callType,
                callStatus: dto.callStatus,
                duration: dto.duration,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                notes: dto.notes,
                outcome: dto.outcome,
                recordingUrl: dto.recordingUrl,
                isAnswered: dto.isAnswered,
                metadata: dto.metadata,
                updatedAt: new Date(),
            },
        });
        return { success: true, data: { item } };
    }
    async remove(id) {
        await this.prisma.callLog.delete({ where: { id } });
        return { success: true };
    }
};
exports.CallLogsService = CallLogsService;
exports.CallLogsService = CallLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CallLogsService);
//# sourceMappingURL=call-logs.service.js.map