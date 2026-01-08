import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive database seeding...');

    // 1. Create Super Admin
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

    // 3. Create Test User
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

    // 4. Seed Permissions
    try {
        const basePermissions = [
            // Dashboard
            { name: 'View Dashboard', key: 'dashboard.read', module: 'Dashboard', description: 'View dashboard' },

            // Users
            { name: 'View Users', key: 'user.read', module: 'Users', description: 'View users' },
            { name: 'Create Users', key: 'user.create', module: 'Users', description: 'Create users' },
            { name: 'Update Users', key: 'user.update', module: 'Users', description: 'Update users' },
            { name: 'Delete Users', key: 'user.delete', module: 'Users', description: 'Delete users' },

            // Roles
            { name: 'View Roles', key: 'role.read', module: 'Roles', description: 'View roles' },
            { name: 'Create Roles', key: 'role.create', module: 'Roles', description: 'Create roles' },
            { name: 'Update Roles', key: 'role.update', module: 'Roles', description: 'Update roles' },
            { name: 'Delete Roles', key: 'role.delete', module: 'Roles', description: 'Delete roles' },

            // Permissions management
            { name: 'View Permissions', key: 'permission.read', module: 'Permissions', description: 'View permissions' },
            { name: 'Create Permissions', key: 'permission.create', module: 'Permissions', description: 'Create permissions' },
            { name: 'Update Permissions', key: 'permission.update', module: 'Permissions', description: 'Update permissions' },
            { name: 'Delete Permissions', key: 'permission.delete', module: 'Permissions', description: 'Delete permissions' },

            // Leads
            { name: 'View Leads', key: 'lead.read', module: 'Leads', description: 'View leads' },
            { name: 'Create Leads', key: 'lead.create', module: 'Leads', description: 'Create leads' },
            { name: 'Update Leads', key: 'lead.update', module: 'Leads', description: 'Update leads' },
            { name: 'Delete Leads', key: 'lead.delete', module: 'Leads', description: 'Delete leads' },

            // Deals
            { name: 'View Deals', key: 'deal.read', module: 'Deals', description: 'View deals' },
            { name: 'Create Deals', key: 'deal.create', module: 'Deals', description: 'Create deals' },
            { name: 'Update Deals', key: 'deal.update', module: 'Deals', description: 'Update deals' },
            { name: 'Delete Deals', key: 'deal.delete', module: 'Deals', description: 'Delete deals' },

            // Quotations
            { name: 'View Quotations', key: 'quotation.read', module: 'Quotations', description: 'View quotations' },
            { name: 'Create Quotations', key: 'quotation.create', module: 'Quotations', description: 'Create quotations' },
            { name: 'Update Quotations', key: 'quotation.update', module: 'Quotations', description: 'Update quotations' },
            { name: 'Delete Quotations', key: 'quotation.delete', module: 'Quotations', description: 'Delete quotations' },

            // Invoices
            { name: 'View Invoices', key: 'invoice.read', module: 'Invoices', description: 'View invoices' },
            { name: 'Create Invoices', key: 'invoice.create', module: 'Invoices', description: 'Create invoices' },
            { name: 'Update Invoices', key: 'invoice.update', module: 'Invoices', description: 'Update invoices' },
            { name: 'Delete Invoices', key: 'invoice.delete', module: 'Invoices', description: 'Delete invoices' },

            // Activities / Tasks
            { name: 'View Activities', key: 'activity.read', module: 'Activities', description: 'View tasks and activities' },

            // Business Settings
            { name: 'View Business Settings', key: 'business_settings.read', module: 'BusinessSettings', description: 'View business settings' },
            { name: 'Update Business Settings', key: 'business_settings.update', module: 'BusinessSettings', description: 'Update business settings' },

            // Trash
            { name: 'View Trash', key: 'deleted.read', module: 'Trash', description: 'View deleted items' },

            // Expenses
            { name: 'Expense create', key: 'expense.create', module: 'Expenses', description: 'Create expenses' },
            { name: 'Expense read', key: 'expense.read', module: 'Expenses', description: 'View expenses' },
            { name: 'Expense update', key: 'expense.update', module: 'Expenses', description: 'Edit expenses' },
            { name: 'Expense delete', key: 'expense.delete', module: 'Expenses', description: 'Delete expenses' },
            { name: 'Expense approve', key: 'expense.approve', module: 'Expenses', description: 'Approve/Reject expenses' },

            // Automation
            { name: 'View Automations', key: 'automation.read', module: 'Automation', description: 'View automations' },
            { name: 'Create Automations', key: 'automation.create', module: 'Automation', description: 'Create automations' },
            { name: 'Update Automations', key: 'automation.update', module: 'Automation', description: 'Update automations' },
            { name: 'Delete Automations', key: 'automation.delete', module: 'Automation', description: 'Delete automations' },

            // Dashboard Widgets
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
    } catch (error) {
        console.log('⚠️  Permissions seeding skipped:', error);
    }

    // 5. Create Sales Executive and Sales Manager roles with permissions
    try {
        // Role: Sales Executive (OWN scope)
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

        // Role: Sales Manager (GLOBAL scope)
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

        // Permissions to assign
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

        // Assign permissions (avoid duplicates)
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
    } catch (error) {
        console.log('⚠️  Sales role setup failed:', error);
    }

    // 6. Assign sales roles to sample users
    try {
        const salesExecRole = await prisma.role.findUnique({ where: { name: 'Sales Executive' } });
        const salesMgrRole = await prisma.role.findUnique({ where: { name: 'Sales Manager' } });

        // Ensure sample Sales Executive user exists and assign role
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

        // Ensure sample Sales Manager user exists and assign role
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
    } catch (error) {
        console.log('⚠️  Assigning sales roles to sample users failed:', error);
    }

    // 7. Seed Product Categories
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
    } catch (error) {
        console.log('⚠️  Product categories seeding failed:', error);
    }

    // 8. Seed Unit Types
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
    } catch (error) {
        console.log('⚠️  Unit types seeding failed:', error);
    }

    // 9. Seed Lead Sources
    try {
        const leadSources = [
            { name: 'Website', color: '#3B82F6' },
            { name: 'Referral', color: '#10B981' },
            { name: 'Cold Call', color: '#F59E0B' },
            { name: 'LinkedIn', color: '#0A66C2' },
            { name: 'Email Campaign', color: '#8B5CF6' },
        ];

        for (const source of leadSources) {
            await prisma.leadSource.upsert({
                where: { name: source.name },
                update: {},
                create: {
                    name: source.name,
                    color: source.color,
                    isActive: true,
                },
            });
        }
        console.log(`✅ Lead sources seeded: ${leadSources.length}`);
    } catch (error) {
        console.log('⚠️  Lead sources seeding failed:', error);
    }

    // 10. Seed Industries
    try {
        const industries = [
            'Technology',
            'Healthcare',
            'Finance',
            'Real Estate',
            'Manufacturing',
            'Retail',
        ];

        for (const industry of industries) {
            await prisma.industry.upsert({
                where: { name: industry },
                update: {},
                create: {
                    name: industry,
                    slug: industry.toLowerCase().replace(/ /g, '-'),
                    isActive: true,
                },
            });
        }
        console.log(`✅ Industries seeded: ${industries.length}`);
    } catch (error) {
        console.log('⚠️  Industries seeding failed:', error);
    }

    // 11. Seed Companies
    try {
        const adminUser = await prisma.user.findUnique({ where: { email: 'admin@weconnect.com' } });
        if (!adminUser) {
            console.log('⚠️  Admin user not found, skipping companies seeding');
            return;
        }

        const companies = [
            {
                name: 'TechCorp Solutions',
                domain: 'techcorp.com',
                industryId: 1,
                address: '123 Tech Street, Silicon Valley, CA',
                phone: '+1-555-123-4567',
                email: 'contact@techcorp.com',
                website: 'https://techcorp.com',
                companySize: 'MEDIUM' as const,
                status: 'ACTIVE' as const,
                assignedTo: adminUser.id,
                createdBy: adminUser.id,
            },
            {
                name: 'GlobalTech Innovations',
                domain: 'globaltech.com',
                industryId: 1,
                address: '456 Innovation Ave, New York, NY',
                phone: '+1-555-987-6543',
                email: 'info@globaltech.com',
                website: 'https://globaltech.com',
                companySize: 'LARGE' as const,
                status: 'ACTIVE' as const,
                assignedTo: adminUser.id,
                createdBy: adminUser.id,
            },
            {
                name: 'StartupXYZ',
                domain: 'startupxyz.com',
                industryId: 1,
                address: '789 Startup Way, San Francisco, CA',
                phone: '+1-555-555-5555',
                email: 'hello@startupxyz.com',
                website: 'https://startupxyz.com',
                companySize: 'SMALL' as const,
                status: 'PROSPECT' as const,
                assignedTo: adminUser.id,
                createdBy: adminUser.id,
            },
        ];

        for (const company of companies) {
            await prisma.companies.upsert({
                where: { name: company.name },
                update: {},
                create: company,
            });
        }
        console.log(`✅ Companies seeded: ${companies.length}`);
    } catch (error) {
        console.log('⚠️  Companies seeding failed:', error);
    }

    // 12. Seed Leads
    try {
        const adminUser = await prisma.user.findUnique({ where: { email: 'admin@weconnect.com' } });
        const leadSources = await prisma.leadSource.findMany();
        const companies = await prisma.companies.findMany();

        if (!adminUser || leadSources.length === 0) {
            console.log('⚠️  Required data not found, skipping leads seeding');
            return;
        }

        const leads = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1-555-111-2222',
                company: 'TechCorp Solutions',
                position: 'CTO',
                status: 'NEW' as const,
                sourceId: leadSources[0].id,
                assignedTo: adminUser.id,
                industry: 'Technology',
                budget: 50000.00,
                isActive: true,
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1-555-333-4444',
                company: 'GlobalTech Innovations',
                position: 'CEO',
                status: 'CONTACTED' as const,
                sourceId: leadSources[1].id,
                assignedTo: adminUser.id,
                industry: 'Technology',
                budget: 100000.00,
                isActive: true,
            },
            {
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael.j@example.com',
                phone: '+1-555-555-6666',
                company: 'StartupXYZ',
                position: 'Founder',
                status: 'QUALIFIED' as const,
                sourceId: leadSources[2].id,
                assignedTo: adminUser.id,
                industry: 'Technology',
                budget: 25000.00,
                isActive: true,
            },
        ];

        for (const lead of leads) {
            await prisma.lead.upsert({
                where: { id: (await prisma.lead.findFirst({ where: { email: lead.email } }))?.id || -1 },
                update: {},
                create: lead,
            });
        }
        console.log(`✅ Leads seeded: ${leads.length}`);
    } catch (error) {
        console.log('⚠️  Leads seeding failed:', error);
    }

    // 13. Seed Products
    try {
        const products = [
            {
                name: 'Web Development Service',
                description: 'Complete web application development',
                sku: 'WD-001',
                type: 'SERVICE' as const,
                category: 'Digital Services',
                price: 5000.00,
                currency: 'USD',
                unit: 'project',
                taxRate: 18.00,
                hsnCode: '998313',
                isActive: true,
            },
            {
                name: 'Mobile App Development',
                description: 'iOS and Android mobile application',
                sku: 'MA-001',
                type: 'SERVICE' as const,
                category: 'Digital Services',
                price: 8000.00,
                currency: 'USD',
                unit: 'project',
                taxRate: 18.00,
                hsnCode: '998313',
                isActive: true,
            },
            {
                name: 'CRM Software License',
                description: 'Annual software license for CRM system',
                sku: 'SL-001',
                type: 'DIGITAL' as const,
                category: 'Software',
                price: 1200.00,
                currency: 'USD',
                unit: 'license',
                taxRate: 18.00,
                hsnCode: '998313',
                isActive: true,
            },
        ];

        for (const product of products) {
            await prisma.product.upsert({
                where: { sku: product.sku },
                update: product,
                create: product,
            });
        }
        console.log(`✅ Products seeded: ${products.length}`);
    } catch (error) {
        console.log('⚠️  Products seeding failed:', error);
    }

    // 14. Seed Arabic Field Configurations
    try {
        const arabicFieldConfigs = [
            { entityType: 'lead', fieldName: 'firstNameAr', label: 'First Name (Arabic)', isRequired: false, section: 'personal', displayOrder: 2, validation: { type: 'text' } },
            { entityType: 'lead', fieldName: 'lastNameAr', label: 'Last Name (Arabic)', isRequired: false, section: 'personal', displayOrder: 4, validation: { type: 'text' } },
            { entityType: 'lead', fieldName: 'companyAr', label: 'Company (Arabic)', isRequired: false, section: 'company', displayOrder: 8, validation: { type: 'text' } },
            { entityType: 'lead', fieldName: 'addressAr', label: 'Address (Arabic)', isRequired: false, section: 'location', displayOrder: 19, validation: { type: 'textarea' } }
        ];

        for (const config of arabicFieldConfigs) {
            await prisma.fieldConfig.upsert({
                where: { entityType_fieldName: { entityType: config.entityType, fieldName: config.fieldName } },
                update: config,
                create: config
            });
        }
        console.log(`✅ Arabic field configurations seeded: ${arabicFieldConfigs.length}`);
    } catch (error) {
        console.log('⚠️  Arabic field configurations seeding failed:', error);
    }

    console.log('✅ Comprehensive database seeding completed!');
    console.log('');
    console.log('📋 Default Login Credentials:');
    console.log('   Email: admin@weconnect.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('   Test User:');
    console.log('   Email: test@weconnect.com');
    console.log('   Password: test123');
    console.log('');
    console.log('   Sales Executive:');
    console.log('   Email: sales.exec@weconnect.com');
    console.log('   Password: sales123');
    console.log('');
    console.log('   Sales Manager:');
    console.log('   Email: sales.manager@weconnect.com');
    console.log('   Password: manager123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
