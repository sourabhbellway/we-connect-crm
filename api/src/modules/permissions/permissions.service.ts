import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const defs: Record<string, string[]> = {
      dashboard: ['read'],
      user: ['create', 'read', 'update', 'delete'],
      role: ['create', 'read', 'update', 'delete'],
      permission: ['create', 'read', 'update', 'delete'],
      business_settings: ['read', 'update'],
      // Granular Business Settings
      business_settings_company: ['read', 'update'],
      business_settings_currency: ['create', 'read', 'update', 'delete'],
      business_settings_tax: ['create', 'read', 'update', 'delete'],
      business_settings_numbering: ['read', 'update'],
      business_settings_deal_status: ['create', 'read', 'update', 'delete'],
      business_settings_lead_source: ['create', 'read', 'update', 'delete'],
      business_settings_field_config: ['create', 'read', 'update', 'delete'],
      business_settings_dashboard: ['read', 'update'],
      business_settings_quotation_template: [
        'create',
        'read',
        'update',
        'delete',
      ],
      business_settings_terms_conditions: [
        'create',
        'read',
        'update',
        'delete',
      ],
      business_settings_email_template: ['create', 'read', 'update', 'delete'],
      business_settings_integrations: ['read', 'update', 'sync'],

      lead: [
        'create',
        'read',
        'update',
        'delete',
        'transfer',
        'convert',
        'export',
        'import',
      ],
      // contact: ['create', 'read', 'update', 'delete'],
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

    const toCreate = Object.entries(defs).flatMap(([module, actions]) =>
      actions.map((action) => ({
        name: `${module.replace(/_/g, ' ')} ${action}`.replace(/\b\w/g, (m) =>
          m.toUpperCase(),
        ),
        key: `${module}.${action}`,
        module: module.toUpperCase(),
        description: `Allows ${action} on ${module.replace(/_/g, ' ')}`,
      })),
    );

    // Sync permissions with database
    for (const p of toCreate) {
      await this.prisma.permission.upsert({
        where: { key: p.key },
        update: { name: p.name, module: p.module, description: p.description },
        create: p,
      });
    }

    // Ensure Admin role has all permissions
    const admin = await this.prisma.role.findFirst({
      where: { name: 'Admin' },
      include: { permissions: true },
    });

    if (admin) {
      const allPerms = await this.prisma.permission.findMany();
      const existingIds = new Set(
        admin.permissions.map((rp) => rp.permissionId),
      );

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
}
