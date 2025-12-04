import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@weconnect.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  console.log(`Ensuring admin user ${email} with reset password...`);

  // Ensure admin user exists with known password and flags
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email,
      password: hashed,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user ensured:', user.email);

  // Ensure Admin role exists
  let adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Administrator role with full access',
        isActive: true,
        accessScope: 'GLOBAL',
      },
    });
    console.log('✅ Admin role created');
  }

  // Ensure key permissions exist for admin (dashboard + core entities)
  const permKeys = [
    'dashboard.read',
    'user.read', 'user.create', 'user.update', 'user.delete',
    'role.read', 'role.create', 'role.update', 'role.delete',
    'permission.read', 'permission.create', 'permission.update', 'permission.delete',
    'lead.read', 'lead.create', 'lead.update', 'lead.delete',
  ];
  for (const key of permKeys) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, name: key.toUpperCase(), module: key.split('.')[0] },
    });
  }
  console.log('✅ Base permissions ensured');

  // Attach all ensured permissions to Admin role
  const perms = await prisma.permission.findMany({ where: { key: { in: permKeys } } });
  for (const p of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    });
  }
  console.log('✅ Permissions attached to Admin role');

  // Ensure user has Admin role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });
  console.log('✅ Admin role assigned to user');

  console.log('All done. You can now login with the reset credentials.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
