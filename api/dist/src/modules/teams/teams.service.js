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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TeamsService = class TeamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTeamDto) {
        const { memberIds, ...rest } = createTeamDto;
        const filteredMemberIds = memberIds?.filter(id => id !== rest.managerId);
        return this.prisma.team.create({
            data: {
                ...rest,
                members: filteredMemberIds && filteredMemberIds.length > 0 ? {
                    connect: filteredMemberIds.map((id) => ({ id })),
                } : undefined,
            },
            include: {
                manager: true,
                members: true,
            },
        });
    }
    async findAll() {
        return this.prisma.team.findMany({
            include: {
                manager: true,
                members: true,
                _count: {
                    select: { members: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.team.findUnique({
            where: { id },
            include: {
                manager: true,
                members: true,
            },
        });
    }
    async update(id, updateTeamDto) {
        const { memberIds, ...rest } = updateTeamDto;
        const filteredMemberIds = memberIds?.filter(mid => mid !== (rest.managerId || undefined));
        return this.prisma.team.update({
            where: { id },
            data: {
                ...rest,
                members: memberIds ? {
                    set: filteredMemberIds?.map((id) => ({ id })) || [],
                } : undefined,
            },
            include: {
                manager: true,
                members: true,
            },
        });
    }
    async remove(id) {
        await this.prisma.user.updateMany({
            where: { teamId: id },
            data: { teamId: null },
        });
        return this.prisma.team.delete({
            where: { id },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map