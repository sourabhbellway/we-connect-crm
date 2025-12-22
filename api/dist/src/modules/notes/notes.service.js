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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permission_util_1 = require("../../common/utils/permission.util");
let NotesService = class NotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(leadId, user) {
        try {
            const where = {
                leadId,
                deletedAt: null,
            };
            if (user && user.userId) {
                const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
                if (Object.keys(roleBasedWhere).length > 0) {
                    where.AND = [roleBasedWhere];
                }
            }
            const notes = await this.prisma.note.findMany({
                where,
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' },
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            return { success: true, data: { notes } };
        }
        catch (error) {
            console.error('Error in notes.list:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getById(id, user) {
        try {
            const where = { id, deletedAt: null };
            if (user && user.userId) {
                const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
                if (Object.keys(roleBasedWhere).length > 0) {
                    where.AND = [roleBasedWhere];
                }
            }
            const note = await this.prisma.note.findFirst({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            if (!note) {
                return { success: false, message: 'Note not found' };
            }
            return { success: true, data: { note } };
        }
        catch (error) {
            console.error('Error in notes.getById:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(dto) {
        try {
            const note = await this.prisma.note.create({
                data: {
                    title: dto.title,
                    content: dto.content,
                    isPinned: dto.isPinned ?? false,
                    leadId: dto.leadId,
                    createdBy: dto.createdBy,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Note added',
                        description: `Note "${note.title}" added`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'MessageSquare',
                        iconColor: '#6B7280',
                        metadata: {
                            noteId: note.id,
                            title: note.title,
                        },
                        userId: dto.createdBy,
                        leadId: dto.leadId,
                    },
                });
            }
            catch (activityError) {
                console.error('Error creating note activity:', activityError);
            }
            return { success: true, data: { note } };
        }
        catch (error) {
            console.error('Error in notes.create:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, dto) {
        try {
            const existingNote = await this.prisma.note.findFirst({
                where: { id, deletedAt: null },
            });
            if (!existingNote) {
                return { success: false, message: 'Note not found' };
            }
            const note = await this.prisma.note.update({
                where: { id },
                data: {
                    ...(dto.title && { title: dto.title }),
                    ...(dto.content && { content: dto.content }),
                    ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Note updated',
                        description: `Note "${note.title}" updated`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'Edit',
                        iconColor: '#3B82F6',
                        metadata: {
                            noteId: note.id,
                            title: note.title,
                        },
                        userId: existingNote.createdBy,
                        leadId: existingNote.leadId,
                    },
                });
            }
            catch (activityError) {
                console.error('Error creating note update activity:', activityError);
            }
            return { success: true, data: { note } };
        }
        catch (error) {
            console.error('Error in notes.update:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const note = await this.prisma.note.findFirst({
                where: { id, deletedAt: null },
            });
            if (!note) {
                return { success: false, message: 'Note not found' };
            }
            await this.prisma.note.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            try {
                await this.prisma.activity.create({
                    data: {
                        title: 'Note deleted',
                        description: `Note "${note.title}" deleted`,
                        type: 'COMMUNICATION_LOGGED',
                        icon: 'Trash2',
                        iconColor: '#EF4444',
                        metadata: {
                            noteId: note.id,
                            title: note.title,
                        },
                        userId: note.createdBy,
                        leadId: note.leadId,
                    },
                });
            }
            catch (activityError) {
                console.error('Error creating note delete activity:', activityError);
            }
            return { success: true };
        }
        catch (error) {
            console.error('Error in notes.remove:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map