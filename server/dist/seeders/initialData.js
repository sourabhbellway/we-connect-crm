"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialData = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const businessSettingsSeeder_1 = require("./businessSettingsSeeder");
const seedInitialData = async () => {
    try {
        // Create default permissions
        const permissions = [
            // User permissions
            {
                name: "View Users",
                key: "user.read",
                module: "Users",
                description: "Can view user list",
            },
            {
                name: "Create Users",
                key: "user.create",
                module: "Users",
                description: "Can create new users",
            },
            {
                name: "Update Users",
                key: "user.update",
                module: "Users",
                description: "Can update user information",
            },
            {
                name: "Delete Users",
                key: "user.delete",
                module: "Users",
                description: "Can delete users",
            },
            // Role permissions
            {
                name: "View Roles",
                key: "role.read",
                module: "Roles",
                description: "Can view role list",
            },
            {
                name: "Create Roles",
                key: "role.create",
                module: "Roles",
                description: "Can create new roles",
            },
            {
                name: "Update Roles",
                key: "role.update",
                module: "Roles",
                description: "Can update role information",
            },
            {
                name: "Delete Roles",
                key: "role.delete",
                module: "Roles",
                description: "Can delete roles",
            },
            // Permission permissions
            {
                name: "View Permissions",
                key: "permission.read",
                module: "Permissions",
                description: "Can view permission list",
            },
            // Dashboard permissions
            {
                name: "View Dashboard",
                key: "dashboard.read",
                module: "Dashboard",
                description: "Can access dashboard",
            },
            // Settings permissions
            {
                name: "View Settings",
                key: "settings.read",
                module: "Settings",
                description: "Can view application settings",
            },
            {
                name: "Update Settings",
                key: "settings.update",
                module: "Settings",
                description: "Can update application settings",
            },
            // Lead permissions
            {
                name: "View Leads",
                key: "lead.read",
                module: "Leads",
                description: "Can view lead list",
            },
            {
                name: "Create Leads",
                key: "lead.create",
                module: "Leads",
                description: "Can create new leads",
            },
            {
                name: "Update Leads",
                key: "lead.update",
                module: "Leads",
                description: "Can update lead information",
            },
            {
                name: "Delete Leads",
                key: "lead.delete",
                module: "Leads",
                description: "Can delete leads",
            },
            // Activity permissions
            {
                name: "View Activities",
                key: "activity.read",
                module: "Activities",
                description: "Can view activity logs",
            },
            {
                name: "Create Activities",
                key: "activity.create",
                module: "Activities",
                description: "Can create activity logs",
            },
            {
                name: "View Deleted Data",
                key: "deleted.read",
                module: "Activities",
                description: "Can view deleted users, leads and roles",
            },
            // Task permissions
            {
                name: "View Tasks",
                key: "task.read",
                module: "Tasks",
                description: "Can view task list",
            },
            {
                name: "Create Tasks",
                key: "task.create",
                module: "Tasks",
                description: "Can create new tasks",
            },
            {
                name: "Update Tasks",
                key: "task.update",
                module: "Tasks",
                description: "Can update task information",
            },
            {
                name: "Delete Tasks",
                key: "task.delete",
                module: "Tasks",
                description: "Can delete tasks",
            },
            // Contact permissions
            {
                name: "View Contacts",
                key: "contact.read",
                module: "Contacts",
                description: "Can view contact list",
            },
            {
                name: "Create Contacts",
                key: "contact.create",
                module: "Contacts",
                description: "Can create new contacts",
            },
            {
                name: "Update Contacts",
                key: "contact.update",
                module: "Contacts",
                description: "Can update contact information",
            },
            {
                name: "Delete Contacts",
                key: "contact.delete",
                module: "Contacts",
                description: "Can delete contacts",
            },
            // Deal permissions
            {
                name: "View Deals",
                key: "deal.read",
                module: "Deals",
                description: "Can view deal list",
            },
            {
                name: "Create Deals",
                key: "deal.create",
                module: "Deals",
                description: "Can create new deals",
            },
            {
                name: "Update Deals",
                key: "deal.update",
                module: "Deals",
                description: "Can update deal information",
            },
            {
                name: "Delete Deals",
                key: "deal.delete",
                module: "Deals",
                description: "Can delete deals",
            },
            // Company permissions
            {
                name: "View Companies",
                key: "company.read",
                module: "Companies",
                description: "Can view company list",
            },
            {
                name: "Create Companies",
                key: "company.create",
                module: "Companies",
                description: "Can create new companies",
            },
            {
                name: "Update Companies",
                key: "company.update",
                module: "Companies",
                description: "Can update company information",
            },
            {
                name: "Delete Companies",
                key: "company.delete",
                module: "Companies",
                description: "Can delete companies",
            },
            // Call Log permissions
            {
                name: "View Call Logs",
                key: "calllog.read",
                module: "Call Logs",
                description: "Can view call logs",
            },
            {
                name: "Create Call Logs",
                key: "calllog.create",
                module: "Call Logs",
                description: "Can create call logs",
            },
            {
                name: "Update Call Logs",
                key: "calllog.update",
                module: "Call Logs",
                description: "Can update call logs",
            },
            {
                name: "Delete Call Logs",
                key: "calllog.delete",
                module: "Call Logs",
                description: "Can delete call logs",
            },
            // Communication permissions
            {
                name: "View Communications",
                key: "communication.read",
                module: "Communications",
                description: "Can view communications",
            },
            {
                name: "Create Communications",
                key: "communication.create",
                module: "Communications",
                description: "Can create communications",
            },
            {
                name: "Update Communications",
                key: "communication.update",
                module: "Communications",
                description: "Can update communications",
            },
            {
                name: "Delete Communications",
                key: "communication.delete",
                module: "Communications",
                description: "Can delete communications",
            },
            // Product permissions
            {
                name: "View Products",
                key: "product.read",
                module: "Products",
                description: "Can view product list",
            },
            {
                name: "Create Products",
                key: "product.create",
                module: "Products",
                description: "Can create new products",
            },
            {
                name: "Update Products",
                key: "product.update",
                module: "Products",
                description: "Can update product information",
            },
            {
                name: "Delete Products",
                key: "product.delete",
                module: "Products",
                description: "Can delete products",
            },
            // Proposal Template permissions
            {
                name: "View Proposal Templates",
                key: "proposaltemplate.read",
                module: "Proposal Templates",
                description: "Can view proposal templates",
            },
            {
                name: "Create Proposal Templates",
                key: "proposaltemplate.create",
                module: "Proposal Templates",
                description: "Can create proposal templates",
            },
            {
                name: "Update Proposal Templates",
                key: "proposaltemplate.update",
                module: "Proposal Templates",
                description: "Can update proposal templates",
            },
            {
                name: "Delete Proposal Templates",
                key: "proposaltemplate.delete",
                module: "Proposal Templates",
                description: "Can delete proposal templates",
            },
            // Quotation permissions
            {
                name: "View Quotations",
                key: "quotation.read",
                module: "Quotations",
                description: "Can view quotations",
            },
            {
                name: "Create Quotations",
                key: "quotation.create",
                module: "Quotations",
                description: "Can create quotations",
            },
            {
                name: "Update Quotations",
                key: "quotation.update",
                module: "Quotations",
                description: "Can update quotations",
            },
            {
                name: "Delete Quotations",
                key: "quotation.delete",
                module: "Quotations",
                description: "Can delete quotations",
            },
            // Invoice permissions
            {
                name: "View Invoices",
                key: "invoice.read",
                module: "Invoices",
                description: "Can view invoices",
            },
            {
                name: "Create Invoices",
                key: "invoice.create",
                module: "Invoices",
                description: "Can create invoices",
            },
            {
                name: "Update Invoices",
                key: "invoice.update",
                module: "Invoices",
                description: "Can update invoices",
            },
            {
                name: "Delete Invoices",
                key: "invoice.delete",
                module: "Invoices",
                description: "Can delete invoices",
            },
            // File permissions
            {
                name: "View Files",
                key: "file.read",
                module: "Files",
                description: "Can view files",
            },
            {
                name: "Upload Files",
                key: "file.create",
                module: "Files",
                description: "Can upload files",
            },
            {
                name: "Delete Files",
                key: "file.delete",
                module: "Files",
                description: "Can delete files",
            },
            // Industry permissions
            {
                name: "View Industries",
                key: "industry.read",
                module: "Industries",
                description: "Can view industries",
            },
            {
                name: "Create Industries",
                key: "industry.create",
                module: "Industries",
                description: "Can create industries",
            },
            {
                name: "Update Industries",
                key: "industry.update",
                module: "Industries",
                description: "Can update industries",
            },
            {
                name: "Delete Industries",
                key: "industry.delete",
                module: "Industries",
                description: "Can delete industries",
            },
            // Tag permissions
            {
                name: "View Tags",
                key: "tag.read",
                module: "Tags",
                description: "Can view tags",
            },
            {
                name: "Create Tags",
                key: "tag.create",
                module: "Tags",
                description: "Can create tags",
            },
            {
                name: "Update Tags",
                key: "tag.update",
                module: "Tags",
                description: "Can update tags",
            },
            {
                name: "Delete Tags",
                key: "tag.delete",
                module: "Tags",
                description: "Can delete tags",
            },
            // Lead Source permissions
            {
                name: "View Lead Sources",
                key: "leadsource.read",
                module: "Lead Sources",
                description: "Can view lead sources",
            },
            {
                name: "Create Lead Sources",
                key: "leadsource.create",
                module: "Lead Sources",
                description: "Can create lead sources",
            },
            {
                name: "Update Lead Sources",
                key: "leadsource.update",
                module: "Lead Sources",
                description: "Can update lead sources",
            },
            {
                name: "Delete Lead Sources",
                key: "leadsource.delete",
                module: "Lead Sources",
                description: "Can delete lead sources",
            },
            // Lead Analytics permissions
            {
                name: "View Lead Analytics",
                key: "leadanalytics.read",
                module: "Lead Analytics",
                description: "Can view lead analytics",
            },
            // Business Settings permissions
            {
                name: "View Business Settings",
                key: "businesssettings.read",
                module: "Business Settings",
                description: "Can view business settings",
            },
            {
                name: "Update Business Settings",
                key: "businesssettings.update",
                module: "Business Settings",
                description: "Can update business settings",
            },
        ];
        for (const perm of permissions) {
            await prisma_1.prisma.permission.upsert({
                where: { key: perm.key },
                update: perm,
                create: perm,
            });
        }
        // Create default roles
        const adminRole = await prisma_1.prisma.role.upsert({
            where: { name: "Admin" },
            update: {
                name: "Admin",
                description: "System administrator with full access",
            },
            create: {
                name: "Admin",
                description: "System administrator with full access",
            },
        });
        const userRole = await prisma_1.prisma.role.upsert({
            where: { name: "User" },
            update: {
                name: "User",
                description: "Regular user with limited access",
            },
            create: {
                name: "User",
                description: "Regular user with limited access",
            },
        });
        // Assign all permissions to admin role
        const allPermissions = await prisma_1.prisma.permission.findMany();
        for (const permission of allPermissions) {
            await prisma_1.prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            });
        }
        // Assign limited permissions to user role
        const userPermissions = await prisma_1.prisma.permission.findMany({
            where: {
                key: {
                    in: [
                        "dashboard.read",
                        "user.read",
                        "lead.read",
                        "lead.create",
                        "lead.update",
                        "task.read",
                        "task.create",
                        "task.update",
                        "contact.read",
                        "deal.read",
                        "activity.read",
                        "deleted.read",
                    ],
                },
            },
        });
        for (const permission of userPermissions) {
            await prisma_1.prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: userRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: userRole.id,
                    permissionId: permission.id,
                },
            });
        }
        // Create default admin user
        const hashedPassword = await bcryptjs_1.default.hash("admin123", 12);
        const adminUser = await prisma_1.prisma.user.upsert({
            where: { email: "admin@crm.com" },
            update: {
                email: "admin@crm.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                emailVerified: true, // Admin user should be pre-verified
                emailVerifiedAt: new Date(),
            },
            create: {
                email: "admin@crm.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                emailVerified: true, // Admin user should be pre-verified
                emailVerifiedAt: new Date(),
            },
        });
        // Assign admin role to admin user
        await prisma_1.prisma.userRole.upsert({
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
        // Create default lead sources
        const leadSources = [
            { name: "Website", description: "Lead came from company website" },
            { name: "LinkedIn", description: "Lead came from LinkedIn" },
            { name: "Referral", description: "Lead came from customer referral" },
            { name: "Cold Call", description: "Lead came from cold calling" },
            { name: "Email", description: "Lead came from email campaign" },
            { name: "Social Media", description: "Lead came from social media" },
            { name: "Trade Show", description: "Lead came from trade show" },
            { name: "Other", description: "Lead came from other sources" },
        ];
        for (const sourceData of leadSources) {
            await prisma_1.prisma.leadSource.upsert({
                where: { name: sourceData.name },
                update: sourceData,
                create: sourceData,
            });
        }
        // Create default tags
        const tags = [
            { name: "Hot Lead", color: "#EF4444", description: "High priority lead" },
            {
                name: "Warm Lead",
                color: "#F59E0B",
                description: "Medium priority lead",
            },
            { name: "Cold Lead", color: "#6B7280", description: "Low priority lead" },
            { name: "VIP", color: "#8B5CF6", description: "Very important person" },
            { name: "Follow Up", color: "#10B981", description: "Needs follow up" },
            { name: "Qualified", color: "#3B82F6", description: "Qualified lead" },
            {
                name: "Proposal Sent",
                color: "#06B6D4",
                description: "Proposal has been sent",
            },
            {
                name: "Negotiation",
                color: "#F97316",
                description: "In negotiation phase",
            },
        ];
        for (const tagData of tags) {
            await prisma_1.prisma.tag.upsert({
                where: { name: tagData.name },
                update: tagData,
                create: tagData,
            });
        }
        // Optionally seed sample activities only if explicitly enabled
        if (process.env.SEED_SAMPLE_ACTIVITIES === "true") {
            const sampleActivities = [
                {
                    title: "New User Registered",
                    description: "John Doe created a new account",
                    type: client_1.ActivityType.USER_REGISTRATION,
                    icon: "FiUser",
                    iconColor: "text-blue-600",
                    tags: ["User", "Registration"],
                    userId: adminUser.id,
                },
                {
                    title: "Role Permissions Updated",
                    description: "Admin updated role permissions for User role",
                    type: client_1.ActivityType.ROLE_UPDATE,
                    icon: "FiEdit",
                    iconColor: "text-orange-600",
                    tags: ["Admin", "Security"],
                    userId: adminUser.id,
                },
                {
                    title: "System Backup Completed",
                    description: "Daily backup process finished successfully",
                    type: client_1.ActivityType.SYSTEM_BACKUP,
                    icon: "FiDatabase",
                    iconColor: "text-green-600",
                    tags: ["System", "Backup"],
                },
                {
                    title: "Database Migration Started",
                    description: "Database migration process initiated",
                    type: client_1.ActivityType.DATABASE_MIGRATION,
                    icon: "FiDatabase",
                    iconColor: "text-purple-600",
                    tags: ["Database", "Migration"],
                },
                {
                    title: "Security Alert",
                    description: "Failed login attempt from unknown IP address",
                    type: client_1.ActivityType.SECURITY_ALERT,
                    icon: "FiAlertCircle",
                    iconColor: "text-red-600",
                    tags: ["Security", "Alert"],
                },
            ];
            for (let i = 0; i < sampleActivities.length; i++) {
                const activity = sampleActivities[i];
                const createdAt = new Date();
                createdAt.setMinutes(createdAt.getMinutes() - (i + 1) * 5);
                await prisma_1.prisma.activity.create({
                    data: {
                        ...activity,
                        createdAt,
                    },
                });
            }
            //console.log("🔧 Sample activities seeded (SEED_SAMPLE_ACTIVITIES=true)");
        }
        else {
            //console.log("ℹ️ Skipping sample activities seeding");
        }
        // Seed business settings
        await (0, businessSettingsSeeder_1.seedBusinessSettings)();
        console.log("✅ Initial data seeded successfully");
    }
    catch (error) {
        console.error("❌ Error seeding initial data:", error);
        throw error;
    }
};
exports.seedInitialData = seedInitialData;
// Run the seeder if this file is executed directly
if (require.main === module) {
    (0, exports.seedInitialData)()
        .then(() => {
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=initialData.js.map