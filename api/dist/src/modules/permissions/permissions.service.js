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
        const defs = {
            dashboard: ['read'],
            user: ['create', 'read', 'update', 'delete'],
            role: ['create', 'read', 'update', 'delete'],
            permission: ['create', 'read', 'update', 'delete'],
            business_settings: ['read', 'update'],
            business_settings_company: ['read', 'update'],
            business_settings_currency: ['create', 'read', 'update', 'delete'],
            business_settings_tax: ['create', 'read', 'update', 'delete'],
            business_settings_numbering: ['read', 'update'],
            business_settings_deal_status: ['create', 'read', 'update', 'delete'],
            business_settings_lead_source: ['create', 'read', 'update', 'delete'],
            business_settings_field_config: ['create', 'read', 'update', 'delete'],
            business_settings_dashboard: ['read', 'update'],
            business_settings_quotation_template: ['create', 'read', 'update', 'delete'],
            business_settings_terms_conditions: ['create', 'read', 'update', 'delete'],
            business_settings_email_template: ['create', 'read', 'update', 'delete'],
            business_settings_integrations: ['read', 'update', 'sync'],
            lead: ['create', 'read', 'update', 'delete', 'transfer', 'convert', 'export', 'import'],
            deal: ['create', 'read', 'update', 'delete'],
            activity: ['read'],
            files: ['read', 'create', 'delete'],
            quotations: ['create', 'read', 'update', 'delete'],
            invoices: ['create', 'read', 'update', 'delete'],
            tasks: ['create', 'read', 'update', 'delete'],
            communications: ['create', 'read', 'update', 'delete'],
            expense: ['create', 'read', 'update', 'delete', 'approve'],
            automation: ['create', 'read', 'update', 'delete'],
            dashboard_widgets: ['create', 'read', 'update', 'delete'],
            teams: ['create', 'read', 'update', 'delete'],
            products: ['create', 'read', 'update', 'delete', 'import', 'export'],
            product_categories: ['create', 'read', 'update', 'delete'],
            industries: ['create', 'read', 'update', 'delete'],
            tags: ['create', 'read', 'update', 'delete'],
            unit_types: ['create', 'read', 'update', 'delete'],
            notifications: ['read', 'update', 'delete'],
            trash: ['read', 'restore', 'delete'],
            notes: ['create', 'read', 'update', 'delete'],
            payments: ['create', 'read', 'update', 'delete'],
            proposal_templates: ['create', 'read', 'update', 'delete'],
        };
        const toCreate = Object.entries(defs).flatMap(([module, actions]) => actions.map((action) => ({
            name: `${module.replace(/_/g, ' ')} ${action}`.replace(/\b\w/g, (m) => m.toUpperCase()),
            key: `${module}.${action}`,
            module: module.toUpperCase(),
            description: `Allows ${action} on ${module.replace(/_/g, ' ')}`,
        })));
        for (const p of toCreate) {
            await this.prisma.permission.upsert({
                where: { key: p.key },
                update: { name: p.name, module: p.module, description: p.description },
                create: p,
            });
        }
        const admin = await this.prisma.role.findFirst({
            where: { name: 'Admin' },
            include: { permissions: true },
        });
        if (admin) {
            const allPerms = await this.prisma.permission.findMany();
            const existingIds = new Set(admin.permissions.map((rp) => rp.permissionId));
            for (const p of allPerms) {
                if (!existingIds.has(p.id)) {
                    await this.prisma.rolePermission.create({
                        data: { roleId: admin.id, permissionId: p.id },
                    });
                }
            }
        }
        const items = await this.prisma.permission.findMany({
            orderBy: { module: 'asc' },
        });
        return { success: true, data: items };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map