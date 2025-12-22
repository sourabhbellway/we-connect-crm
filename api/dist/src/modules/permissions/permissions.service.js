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
                expense: ['create', 'read', 'update', 'delete', 'approve'],
                automation: ['create', 'read', 'update', 'delete'],
                dashboard_widgets: ['create', 'read', 'update', 'delete'],
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
        else {
            const expensePerms = [
                { name: 'Expense create', key: 'expense.create', module: 'EXPENSE', description: 'Allows create on expense' },
                { name: 'Expense read', key: 'expense.read', module: 'EXPENSE', description: 'Allows read on expense' },
                { name: 'Expense update', key: 'expense.update', module: 'EXPENSE', description: 'Allows update on expense' },
                { name: 'Expense delete', key: 'expense.delete', module: 'EXPENSE', description: 'Allows delete on expense' },
                { name: 'Expense approve', key: 'expense.approve', module: 'EXPENSE', description: 'Allows approve on expense' },
            ];
            await this.prisma.permission.createMany({ data: expensePerms, skipDuplicates: true });
            const admin = await this.prisma.role.findFirst({ where: { name: 'Admin' }, include: { permissions: true } });
            if (admin) {
                const expenseKeys = expensePerms.map((p) => p.key);
                const perms = await this.prisma.permission.findMany({ where: { key: { in: expenseKeys } } });
                const existingIds = new Set(admin.permissions.map((rp) => rp.permissionId));
                for (const p of perms) {
                    if (!existingIds.has(p.id)) {
                        await this.prisma.rolePermission.create({ data: { roleId: admin.id, permissionId: p.id } });
                    }
                }
            }
            items = await this.prisma.permission.findMany({ orderBy: { module: 'asc' } });
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