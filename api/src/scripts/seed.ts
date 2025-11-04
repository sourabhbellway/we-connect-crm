import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Super Admin (अगर SuperAdmin system use कर रहे हैं)
  try {
    const existingSuperAdmin = await prisma.superAdmin.findUnique({
      where: { email: 'admin@weconnect.com' },
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const superAdmin = await prisma.superAdmin.create({
        data: {
          email: 'admin@weconnect.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          isActive: true,
        },
      });
      console.log('✅ Super Admin created:', superAdmin.email);
    } else {
      console.log('ℹ️  Super Admin already exists');
    }
  } catch (error) {
    console.log('⚠️  Super Admin creation skipped:', error);
  }

  // 2. Create Regular Admin User
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@weconnect.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@weconnect.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          emailVerified: true,
        },
      });
      console.log('✅ Admin User created:', adminUser.email);

      // Create Admin Role
      let adminRole = await prisma.role.findUnique({
        where: { name: 'Admin' },
      });

      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: {
            name: 'Admin',
            description: 'Administrator role with full access',
            isActive: true,
            accessScope: 'GLOBAL',
          },
        });
        console.log('✅ Admin Role created');
      }

      // Assign role to admin user
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: adminUser.id,
            roleId: adminRole.id,
          },
        },
        update: {},
        create: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });
      console.log('✅ Role assigned to admin user');
    } else {
      console.log('ℹ️  Admin User already exists');
    }
  } catch (error) {
    console.log('⚠️  Admin User creation error:', error);
  }

  // 3. Create Test User (Optional)
  try {
    const existingTestUser = await prisma.user.findUnique({
      where: { email: 'test@weconnect.com' },
    });

    if (!existingTestUser) {
      const hashedPassword = await bcrypt.hash('test123', 10);
      const testUser = await prisma.user.create({
        data: {
          email: 'test@weconnect.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          emailVerified: true,
        },
      });
      console.log('✅ Test User created:', testUser.email);
    } else {
      console.log('ℹ️  Test User already exists');
    }
  } catch (error) {
    console.log('⚠️  Test User creation skipped:', error);
  }

  // 4. Seed Permissions (अगर permissions service में नहीं हैं)
  try {
    const permissionCount = await prisma.permission.count();
    if (permissionCount === 0) {
      const permissions = [
        // Dashboard
        { name: 'View Dashboard', key: 'dashboard.read', module: 'Dashboard', description: 'View dashboard' },
        
        // Users
        { name: 'View Users', key: 'user.read', module: 'Users', description: 'View users' },
        { name: 'Create Users', key: 'user.create', module: 'Users', description: 'Create users' },
        { name: 'Update Users', key: 'user.update', module: 'Users', description: 'Update users' },
        { name: 'Delete Users', key: 'user.delete', module: 'Users', description: 'Delete users' },
        
        // Leads
        { name: 'View Leads', key: 'lead.read', module: 'Leads', description: 'View leads' },
        { name: 'Create Leads', key: 'lead.create', module: 'Leads', description: 'Create leads' },
        { name: 'Update Leads', key: 'lead.update', module: 'Leads', description: 'Update leads' },
        { name: 'Delete Leads', key: 'lead.delete', module: 'Leads', description: 'Delete leads' },
        
        // Contacts
        { name: 'View Contacts', key: 'contact.read', module: 'Contacts', description: 'View contacts' },
        { name: 'Create Contacts', key: 'contact.create', module: 'Contacts', description: 'Create contacts' },
        { name: 'Update Contacts', key: 'contact.update', module: 'Contacts', description: 'Update contacts' },
        { name: 'Delete Contacts', key: 'contact.delete', module: 'Contacts', description: 'Delete contacts' },
        
        // Deals
        { name: 'View Deals', key: 'deal.read', module: 'Deals', description: 'View deals' },
        { name: 'Create Deals', key: 'deal.create', module: 'Deals', description: 'Create deals' },
        { name: 'Update Deals', key: 'deal.update', module: 'Deals', description: 'Update deals' },
        { name: 'Delete Deals', key: 'deal.delete', module: 'Deals', description: 'Delete deals' },
        
        // Roles
        { name: 'View Roles', key: 'role.read', module: 'Roles', description: 'View roles' },
        { name: 'Create Roles', key: 'role.create', module: 'Roles', description: 'Create roles' },
        { name: 'Update Roles', key: 'role.update', module: 'Roles', description: 'Update roles' },
        { name: 'Delete Roles', key: 'role.delete', module: 'Roles', description: 'Delete roles' },
      ];

      for (const perm of permissions) {
        await prisma.permission.upsert({
          where: { key: perm.key },
          update: {},
          create: perm,
        });
      }
      console.log(`✅ ${permissions.length} Permissions seeded`);
    } else {
      console.log('ℹ️  Permissions already exist');
    }
  } catch (error) {
    console.log('⚠️  Permissions seeding skipped:', error);
  }

  // 5. Assign all permissions to Admin role
  try {
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' },
      include: { permissions: true },
    });

    if (adminRole) {
      const allPermissions = await prisma.permission.findMany();
      const existingPermissionIds = adminRole.permissions.map(p => p.permissionId);
      const newPermissionIds = allPermissions
        .filter(p => !existingPermissionIds.includes(p.id))
        .map(p => p.id);

      if (newPermissionIds.length > 0) {
        for (const permId of newPermissionIds) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permId,
            },
          });
        }
        console.log(`✅ ${newPermissionIds.length} Permissions assigned to Admin role`);
      } else {
        console.log('ℹ️  All permissions already assigned to Admin role');
      }
    }
  } catch (error) {
    console.log('⚠️  Permission assignment skipped:', error);
  }

  console.log('✅ Database seeding completed!');
  console.log('');
  console.log('📋 Default Login Credentials:');
  console.log('   Email: admin@weconnect.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('   Test User:');
  console.log('   Email: test@weconnect.com');
  console.log('   Password: test123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

