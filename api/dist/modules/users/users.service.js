"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async mapUser(u) {
        if (!u)
            return null;
        const roles = (u.roles || []).map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: (ur.role.permissions || []).map((rp) => ({
                id: rp.permission.id,
                key: rp.permission.key,
                name: rp.permission.name,
                module: rp.permission.module,
            })),
        }));
        return {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
            roles,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        };
    }
    async findAll() {
        const rows = await this.prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const users = await Promise.all(rows.map((u) => this.mapUser(u)));
        return { success: true, data: users };
    }
    async getStats() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsers, newUsers] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
        ]);
        const inactiveUsers = Math.max(0, totalUsers - activeUsers);
        return {
            success: true,
            data: {
                stats: { totalUsers, activeUsers, inactiveUsers, newUsers },
            },
        };
    }
    async findOne(id) {
        const u = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } },
                        },
                    },
                },
            },
        });
        return { success: true, data: await this.mapUser(u) };
    }
    async assignRoles(userId, roleIds) {
        await this.prisma.userRole.deleteMany({ where: { userId } });
        if (roleIds?.length) {
            await this.prisma.userRole.createMany({
                data: roleIds.map((roleId) => ({ userId, roleId })),
            });
        }
        return { success: true };
    }
    async create(dto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });
        return { success: true, data: { user } };
    }
    async update(id, dto) {
        const data = {};
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        const user = await this.prisma.user.update({ where: { id }, data });
        return { success: true, data: { user } };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map