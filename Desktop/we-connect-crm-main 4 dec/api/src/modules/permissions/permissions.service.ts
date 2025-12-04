import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    let items = await this.prisma.permission.findMany({
      orderBy: { module: 'asc' },
    });

    if (!items.length) {
      // Seed a sane default set of permissions if none exist
      const defs: Record<string, string[]> = {
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
      
        // ✅ New modules added
        automation: ['create', 'read', 'update', 'delete'],
        dashboard_widgets: ['create', 'read', 'update', 'delete'],
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

      await this.prisma.permission.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      items = await this.prisma.permission.findMany({
        orderBy: { module: 'asc' },
      });
    } else {
      // Ensure expense permissions exist even if permissions are already seeded
      const expensePerms = [
        { name: 'Expense create', key: 'expense.create', module: 'EXPENSE', description: 'Allows create on expense' },
        { name: 'Expense read', key: 'expense.read', module: 'EXPENSE', description: 'Allows read on expense' },
        { name: 'Expense update', key: 'expense.update', module: 'EXPENSE', description: 'Allows update on expense' },
        { name: 'Expense delete', key: 'expense.delete', module: 'EXPENSE', description: 'Allows delete on expense' },
        { name: 'Expense approve', key: 'expense.approve', module: 'EXPENSE', description: 'Allows approve on expense' },
      ];
      await this.prisma.permission.createMany({ data: expensePerms, skipDuplicates: true });

      // Assign missing expense permissions to Admin role
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

      // Refresh items to include any new permissions
      items = await this.prisma.permission.findMany({ orderBy: { module: 'asc' } });
    }

    return { success: true, data: items };
  }
}
