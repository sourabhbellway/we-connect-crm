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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const REFRESH_LIFETIME_DAYS = 7;
const ACCESS_LIFETIME_HOURS = 24;
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    tokenExpiryISO(hours) {
        const d = new Date();
        d.setHours(d.getHours() + hours);
        return d.toISOString();
    }
    async buildUserWithRoles(userId) {
        const u = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                lastLogin: true,
                profilePicture: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                permissions: {
                                    select: {
                                        permission: {
                                            select: { id: true, name: true, key: true, module: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!u)
            return null;
        let transformedRoles = u.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.permissions.map((rp) => rp.permission),
        }));
        if (!transformedRoles.length) {
            const keys = [
                'dashboard.read',
                'user.create',
                'user.read',
                'user.update',
                'user.delete',
                'role.create',
                'role.read',
                'role.update',
                'role.delete',
                'permission.create',
                'permission.read',
                'permission.update',
                'permission.delete',
                'lead.create',
                'lead.read',
                'lead.update',
                'lead.delete',
                'contact.create',
                'contact.read',
                'contact.update',
                'contact.delete',
                'deal.create',
                'deal.read',
                'deal.update',
                'deal.delete',
                'business_settings.read',
                'business_settings.update',
            ];
            transformedRoles = [
                {
                    id: 0,
                    name: 'admin',
                    permissions: keys.map((key) => ({
                        id: 0,
                        key,
                        name: key.toUpperCase(),
                        module: key.split('.')[0].toUpperCase(),
                    })),
                },
            ];
        }
        return {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            fullName: `${u.firstName} ${u.lastName}`,
            lastLogin: u.lastLogin,
            profilePicture: u.profilePicture || undefined,
            roles: transformedRoles,
        };
    }
    async login(dto) {
        const user = await this.prisma.user
            .findUnique({ where: { email: dto.email } })
            .catch(() => null);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            return { success: false, message: 'Invalid credentials' };
        }
        const payload = { userId: user.id, email: user.email };
        const accessToken = await this.jwt.signAsync(payload);
        const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);
        const refreshToken = await bcrypt.hash(`${user.id}:${Date.now()}`, 10);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + REFRESH_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
            },
        });
        const enrichedUser = await this.buildUserWithRoles(user.id);
        return {
            success: true,
            data: {
                accessToken,
                refreshToken,
                tokenExpiry,
                user: enrichedUser,
            },
        };
    }
    async register(dto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });
        const enrichedUser = await this.buildUserWithRoles(user.id);
        return { success: true, data: { user: enrichedUser } };
    }
    async refreshToken(dto) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
        });
        if (!record || record.isRevoked || record.expiresAt <= new Date()) {
            return { success: false, message: 'Invalid refresh token' };
        }
        const user = await this.prisma.user.findUnique({
            where: { id: record.userId },
        });
        if (!user)
            return { success: false, message: 'User not found' };
        const payload = { userId: user.id, email: user.email };
        const accessToken = await this.jwt.signAsync(payload);
        const tokenExpiry = this.tokenExpiryISO(ACCESS_LIFETIME_HOURS);
        return { success: true, data: { accessToken, tokenExpiry } };
    }
    async logout(refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { isRevoked: true },
            });
        }
        return { success: true, message: 'Logged out successfully' };
    }
    async profile(userId) {
        const user = await this.buildUserWithRoles(userId);
        return { success: true, data: { user } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map