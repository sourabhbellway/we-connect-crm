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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
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
        }
        else {
            console.log('ℹ️  Super Admin already exists');
        }
    }
    catch (error) {
        console.log('⚠️  Super Admin creation skipped:', error);
    }
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
        }
        else {
            console.log('ℹ️  Admin User already exists');
        }
    }
    catch (error) {
        console.log('⚠️  Admin User creation error:', error);
    }
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
        }
        else {
            console.log('ℹ️  Test User already exists');
        }
    }
    catch (error) {
        console.log('⚠️  Test User creation skipped:', error);
    }
    try {
        const basePermissions = [
            { name: 'View Dashboard', key: 'dashboard.read', module: 'Dashboard', description: 'View dashboard' },
            { name: 'View Users', key: 'user.read', module: 'Users', description: 'View users' },
            { name: 'Create Users', key: 'user.create', module: 'Users', description: 'Create users' },
            { name: 'Update Users', key: 'user.update', module: 'Users', description: 'Update users' },
            { name: 'Delete Users', key: 'user.delete', module: 'Users', description: 'Delete users' },
            { name: 'View Roles', key: 'role.read', module: 'Roles', description: 'View roles' },
            { name: 'Create Roles', key: 'role.create', module: 'Roles', description: 'Create roles' },
            { name: 'Update Roles', key: 'role.update', module: 'Roles', description: 'Update roles' },
            { name: 'Delete Roles', key: 'role.delete', module: 'Roles', description: 'Delete roles' },
            { name: 'View Permissions', key: 'permission.read', module: 'Permissions', description: 'View permissions' },
            { name: 'Create Permissions', key: 'permission.create', module: 'Permissions', description: 'Create permissions' },
            { name: 'Update Permissions', key: 'permission.update', module: 'Permissions', description: 'Update permissions' },
            { name: 'Delete Permissions', key: 'permission.delete', module: 'Permissions', description: 'Delete permissions' },
            { name: 'View Leads', key: 'lead.read', module: 'Leads', description: 'View leads' },
            { name: 'Create Leads', key: 'lead.create', module: 'Leads', description: 'Create leads' },
            { name: 'Update Leads', key: 'lead.update', module: 'Leads', description: 'Update leads' },
            { name: 'Delete Leads', key: 'lead.delete', module: 'Leads', description: 'Delete leads' },
            { name: 'View Deals', key: 'deal.read', module: 'Deals', description: 'View deals' },
            { name: 'Create Deals', key: 'deal.create', module: 'Deals', description: 'Create deals' },
            { name: 'Update Deals', key: 'deal.update', module: 'Deals', description: 'Update deals' },
            { name: 'Delete Deals', key: 'deal.delete', module: 'Deals', description: 'Delete deals' },
            { name: 'View Quotations', key: 'quotation.read', module: 'Quotations', description: 'View quotations' },
            { name: 'Create Quotations', key: 'quotation.create', module: 'Quotations', description: 'Create quotations' },
            { name: 'Update Quotations', key: 'quotation.update', module: 'Quotations', description: 'Update quotations' },
            { name: 'Delete Quotations', key: 'quotation.delete', module: 'Quotations', description: 'Delete quotations' },
            { name: 'View Invoices', key: 'invoice.read', module: 'Invoices', description: 'View invoices' },
            { name: 'Create Invoices', key: 'invoice.create', module: 'Invoices', description: 'Create invoices' },
            { name: 'Update Invoices', key: 'invoice.update', module: 'Invoices', description: 'Update invoices' },
            { name: 'Delete Invoices', key: 'invoice.delete', module: 'Invoices', description: 'Delete invoices' },
            { name: 'View Activities', key: 'activity.read', module: 'Activities', description: 'View tasks and activities' },
            { name: 'View Business Settings', key: 'business_settings.read', module: 'BusinessSettings', description: 'View business settings' },
            { name: 'Update Business Settings', key: 'business_settings.update', module: 'BusinessSettings', description: 'Update business settings' },
            { name: 'View Trash', key: 'deleted.read', module: 'Trash', description: 'View deleted items' },
            { name: 'Expense create', key: 'expense.create', module: 'Expenses', description: 'Create expenses' },
            { name: 'Expense read', key: 'expense.read', module: 'Expenses', description: 'View expenses' },
            { name: 'Expense update', key: 'expense.update', module: 'Expenses', description: 'Edit expenses' },
            { name: 'Expense delete', key: 'expense.delete', module: 'Expenses', description: 'Delete expenses' },
            { name: 'Expense approve', key: 'expense.approve', module: 'Expenses', description: 'Approve/Reject expenses' },
            { name: 'View Automations', key: 'automation.read', module: 'Automation', description: 'View automations' },
            { name: 'Create Automations', key: 'automation.create', module: 'Automation', description: 'Create automations' },
            { name: 'Update Automations', key: 'automation.update', module: 'Automation', description: 'Update automations' },
            { name: 'Delete Automations', key: 'automation.delete', module: 'Automation', description: 'Delete automations' },
            { name: 'View User Stats Widget', key: 'dashboard.stats_users', module: 'Dashboard', description: 'View user statistics widget' },
            { name: 'View Role Stats Widget', key: 'dashboard.stats_roles', module: 'Dashboard', description: 'View role statistics widget' },
            { name: 'View Lead Stats Widget', key: 'dashboard.stats_leads', module: 'Dashboard', description: 'View lead statistics widget' },
            { name: 'View System Status Widget', key: 'dashboard.system_status', module: 'Dashboard', description: 'View system status widget' },
            { name: 'View System Activity Widget', key: 'dashboard.system_activity', module: 'Dashboard', description: 'View system activity widget' },
            { name: 'View Activity Calendar Widget', key: 'dashboard.activity_calendar', module: 'Dashboard', description: 'View activity calendar widget' },
            { name: 'View Performance Widget', key: 'dashboard.performance', module: 'Dashboard', description: 'View performance widget' },
            { name: 'View Revenue Metrics Widget', key: 'dashboard.revenue_metrics', module: 'Dashboard', description: 'View revenue metrics widget' },
            { name: 'View Activity Engagement Widget', key: 'dashboard.activity_engagement', module: 'Dashboard', description: 'View activity & engagement widget' },
        ];
        for (const perm of basePermissions) {
            await prisma.permission.upsert({
                where: { key: perm.key },
                update: {},
                create: perm,
            });
        }
        console.log(`✅ Permissions ensured: ${basePermissions.length}`);
    }
    catch (error) {
        console.log('⚠️  Permissions seeding skipped:', error);
    }
    try {
        const salesExec = await prisma.role.upsert({
            where: { name: 'Sales Executive' },
            update: {},
            create: {
                name: 'Sales Executive',
                description: 'Can manage own leads/deals and view activities',
                isActive: true,
                accessScope: 'OWN',
            },
        });
        const salesMgr = await prisma.role.upsert({
            where: { name: 'Sales Manager' },
            update: {},
            create: {
                name: 'Sales Manager',
                description: 'Manage team leads/deals and quotations, view activities',
                isActive: true,
                accessScope: 'GLOBAL',
            },
        });
        const execKeys = [
            'dashboard.read',
            'lead.read', 'lead.create', 'lead.update',
            'deal.read', 'deal.create', 'deal.update',
            'quotation.read', 'quotation.create', 'quotation.update',
            'invoice.read',
            'activity.read',
        ];
        const mgrKeys = [
            ...execKeys,
            'lead.delete',
            'deal.delete',
            'quotation.delete',
            'invoice.update', 'invoice.delete',
        ];
        const execPerms = await prisma.permission.findMany({ where: { key: { in: execKeys } } });
        const mgrPerms = await prisma.permission.findMany({ where: { key: { in: mgrKeys } } });
        for (const p of execPerms) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: salesExec.id, permissionId: p.id } },
                update: {},
                create: { roleId: salesExec.id, permissionId: p.id },
            });
        }
        for (const p of mgrPerms) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: salesMgr.id, permissionId: p.id } },
                update: {},
                create: { roleId: salesMgr.id, permissionId: p.id },
            });
        }
        console.log('✅ Roles ensured: Sales Executive, Sales Manager (with permissions)');
    }
    catch (error) {
        console.log('⚠️  Sales role setup failed:', error);
    }
    try {
        const salesExecRole = await prisma.role.findUnique({ where: { name: 'Sales Executive' } });
        const salesMgrRole = await prisma.role.findUnique({ where: { name: 'Sales Manager' } });
        const salesExecUser = await prisma.user.upsert({
            where: { email: 'sales.exec@weconnect.com' },
            update: {},
            create: {
                email: 'sales.exec@weconnect.com',
                password: await bcrypt.hash('sales123', 10),
                firstName: 'Sales',
                lastName: 'Executive',
                isActive: true,
                emailVerified: true,
            },
        });
        if (salesExecRole) {
            await prisma.userRole.upsert({
                where: { userId_roleId: { userId: salesExecUser.id, roleId: salesExecRole.id } },
                update: {},
                create: { userId: salesExecUser.id, roleId: salesExecRole.id },
            });
        }
        const salesMgrUser = await prisma.user.upsert({
            where: { email: 'sales.manager@weconnect.com' },
            update: {},
            create: {
                email: 'sales.manager@weconnect.com',
                password: await bcrypt.hash('manager123', 10),
                firstName: 'Sales',
                lastName: 'Manager',
                isActive: true,
                emailVerified: true,
            },
        });
        if (salesMgrRole) {
            await prisma.userRole.upsert({
                where: { userId_roleId: { userId: salesMgrUser.id, roleId: salesMgrRole.id } },
                update: {},
                create: { userId: salesMgrUser.id, roleId: salesMgrRole.id },
            });
        }
        console.log('✅ Sample sales users ensured and assigned roles');
    }
    catch (error) {
        console.log('⚠️  Assigning sales roles to sample users failed:', error);
    }
    try {
        const productCategories = [
            { name: 'Electronics', description: 'Electronic devices and accessories' },
            { name: 'Clothing', description: 'Apparel and fashion items' },
            { name: 'Books', description: 'Books and publications' },
            { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
            { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
            { name: 'Beauty & Personal Care', description: 'Cosmetics and personal care products' },
            { name: 'Automotive', description: 'Car parts and automotive accessories' },
            { name: 'Toys & Games', description: 'Toys, games and entertainment items' },
            { name: 'Food & Beverage', description: 'Food items and beverages' },
            { name: 'Health & Wellness', description: 'Health products and wellness items' },
            { name: 'Other', description: 'Miscellaneous products' },
        ];
        for (const category of productCategories) {
            await prisma.productCategory.upsert({
                where: { name: category.name },
                update: {},
                create: {
                    name: category.name,
                    description: category.description,
                    isActive: true,
                },
            });
        }
        console.log(`✅ Product categories seeded: ${productCategories.length}`);
    }
    catch (error) {
        console.log('⚠️  Product categories seeding failed:', error);
    }
    try {
        const unitTypes = [
            { name: 'piece', description: 'Individual piece or item' },
            { name: 'kg', description: 'Kilogram weight measurement' },
            { name: 'gram', description: 'Gram weight measurement' },
            { name: 'liter', description: 'Liter volume measurement' },
            { name: 'meter', description: 'Meter length measurement' },
            { name: 'box', description: 'Box packaging unit' },
            { name: 'pack', description: 'Pack or bundle unit' },
            { name: 'dozen', description: 'Dozen (12 units)' },
            { name: 'unit', description: 'Generic unit measurement' },
        ];
        for (const unitType of unitTypes) {
            await prisma.unitType.upsert({
                where: { name: unitType.name },
                update: {},
                create: {
                    name: unitType.name,
                    description: unitType.description,
                    isActive: true,
                },
            });
        }
        console.log(`✅ Unit types seeded: ${unitTypes.length}`);
    }
    catch (error) {
        console.log('⚠️  Unit types seeding failed:', error);
    }
    try {
        const expensePerms = [
            { name: 'Expense create', key: 'expense.create', module: 'Expenses', description: 'Create expenses' },
            { name: 'Expense read', key: 'expense.read', module: 'Expenses', description: 'View expenses' },
            { name: 'Expense update', key: 'expense.update', module: 'Expenses', description: 'Edit expenses' },
            { name: 'Expense delete', key: 'expense.delete', module: 'Expenses', description: 'Delete expenses' },
            { name: 'Expense approve', key: 'expense.approve', module: 'Expenses', description: 'Approve/Reject expenses' },
        ];
        for (const p of expensePerms) {
            await prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p });
        }
        const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' }, include: { permissions: true } });
        if (adminRole) {
            const existingIds = new Set(adminRole.permissions.map((rp) => rp.permissionId));
            const perms = await prisma.permission.findMany({ where: { key: { in: expensePerms.map((p) => p.key) } } });
            for (const perm of perms) {
                if (!existingIds.has(perm.id)) {
                    await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: perm.id } });
                }
            }
            console.log('✅ Expense permissions ensured and assigned to Admin');
        }
    }
    catch (error) {
        console.log('⚠️  Expense permissions ensure failed:', error);
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
//# sourceMappingURL=seed.js.map