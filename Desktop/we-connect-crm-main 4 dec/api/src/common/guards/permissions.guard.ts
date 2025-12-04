import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific permission is required, allow access
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const userId: number | undefined = request?.user?.userId ?? request?.user?.id;
    if (!userId) return false;

    // Load user's permissions via roles
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    // Admin / Super Admin shortcut (case insensitive)
    const hasFullAccessRole = roles.some((r) => {
      const roleName = (r.role?.name || '').toLowerCase();
      return roleName === 'admin' || roleName === 'super admin' || roleName === 'super_admin';
    });
    if (hasFullAccessRole) return true;

    const keys = new Set<string>();
    for (const ur of roles) {
      for (const rp of ur.role.permissions) {
        if (rp.permission?.key) keys.add(rp.permission.key);
      }
    }

    // Grant if user has any of the required permissions
    return required.some((perm) => keys.has(perm));
  }
}
