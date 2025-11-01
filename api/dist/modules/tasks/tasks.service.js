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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, status, search, leadId, dealId, contactId, }) {
        const where = { deletedAt: null };
        if (status)
            where.status = status.toUpperCase();
        if (leadId)
            where.leadId = leadId;
        if (dealId)
            where.dealId = dealId;
        if (contactId)
            where.contactId = contactId;
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.task.count({ where }),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async getById(id) {
        const task = await this.prisma.task.findFirst({
            where: { id, deletedAt: null },
        });
        if (!task)
            return { success: false, message: 'Task not found' };
        return { success: true, data: { task } };
    }
    async create(dto) {
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description ?? null,
                status: dto.status ?? 'PENDING',
                priority: dto.priority ?? 'MEDIUM',
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                assignedTo: dto.assignedTo ?? null,
                createdBy: dto.createdBy,
                leadId: dto.leadId ?? null,
                dealId: dto.dealId ?? null,
                contactId: dto.contactId ?? null,
            },
        });
        return { success: true, data: { task } };
    }
    async update(id, dto) {
        const task = await this.prisma.task.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                assignedTo: dto.assignedTo ?? undefined,
                leadId: dto.leadId ?? undefined,
                dealId: dto.dealId ?? undefined,
                contactId: dto.contactId ?? undefined,
                updatedAt: new Date(),
            },
        });
        return { success: true, data: { task } };
    }
    async complete(id) {
        const task = await this.prisma.task.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        return { success: true, data: { task } };
    }
    async remove(id) {
        await this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map