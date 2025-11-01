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
    }

    return { success: true, data: items };
  }
}
