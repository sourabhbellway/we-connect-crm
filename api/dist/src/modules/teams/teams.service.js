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
        console.log('Creating team with DTO:', JSON.stringify(createTeamDto, null, 2));
        const { memberIds, ...rest } = createTeamDto;
        const filteredMemberIds = memberIds?.filter(id => id !== rest.managerId);
        const result = await this.prisma.team.create({
            data: {
                ...rest,
                members: filteredMemberIds && filteredMemberIds.length > 0 ? {
                    connect: filteredMemberIds.map((id) => ({ id })),
                } : undefined,
            },
            include: {
                manager: true,
                members: true,
                product: true,
            },
        });
        console.log('Created team result:', JSON.stringify(result, null, 2));
        return result;
    }
    async findAll() {
        const result = await this.prisma.team.findMany({
            include: {
                manager: true,
                members: true,
                product: true,
                _count: {
                    select: { members: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log('All teams found:', JSON.stringify(result, null, 2));
        return result;
    }
    async findOne(id) {
        return this.prisma.team.findUnique({
            where: { id },
            include: {
                manager: true,
                members: true,
                product: true,
            },
        });
    }
    async update(id, updateTeamDto) {
        console.log(`Updating team ${id} with DTO:`, JSON.stringify(updateTeamDto, null, 2));
        const { memberIds, ...rest } = updateTeamDto;
        const filteredMemberIds = memberIds?.filter(mid => mid !== (rest.managerId || undefined));
        const result = await this.prisma.team.update({
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
                product: true,
            },
        });
        console.log('Updated team result:', JSON.stringify(result, null, 2));
        return result;
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