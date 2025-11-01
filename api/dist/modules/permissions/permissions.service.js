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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        let items = await this.prisma.permission.findMany({
            orderBy: { module: 'asc' },
        });
        if (!items.length) {
            const defs = {
                dashboard: ['read'],
                user: ['create', 'read', 'update', 'delete'],
                role: ['create', 'read', 'update', 'delete'],
                permission: ['create', 'read', 'update', 'delete'],
                business_settings: ['read', 'update'],
                lead: ['create', 'read', 'update', 'delete'],
                contact: ['create', 'read', 'update', 'delete'],
                deal: ['create', 'read', 'update', 'delete'],
                activity: ['read'],
                files: ['read', 'create', 'delete'],
                quotations: ['create', 'read', 'update', 'delete'],
                invoices: ['create', 'read', 'update', 'delete'],
                tasks: ['create', 'read', 'update', 'delete'],
                communications: ['create', 'read'],
            };
            const toCreate = Object.entries(defs).flatMap(([module, actions]) => actions.map((action) => ({
                name: `${module.replace(/_/g, ' ')} ${action}`.replace(/\b\w/g, (m) => m.toUpperCase()),
                key: `${module}.${action}`,
                module: module.toUpperCase(),
                description: `Allows ${action} on ${module.replace(/_/g, ' ')}`,
            })));
            await this.prisma.permission.createMany({
                data: toCreate,
                skipDuplicates: true,
            });
            items = await this.prisma.permission.findMany({
                orderBy: { module: 'asc' },
            });
        }
        return { success: true, data: items };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map