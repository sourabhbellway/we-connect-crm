"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdminData = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const seedSuperAdminData = async () => {
    try {
        console.log("🚀 Seeding Super Admin system...");
        // First, get ALL existing permissions from the regular system
        const existingPermissions = await prisma_1.prisma.permission.findMany();
        console.log(`📋 Found ${existingPermissions.length} existing permissions in database`);
        // Create Super Admin permissions (include ALL existing permissions + system permissions)
        const superAdminPermissions = [
            // Include ALL existing permissions from the database
            ...existingPermissions.map((perm) => ({
                name: perm.name,
                key: perm.key,
                module: perm.module,
                description: perm.description || `${perm.name} permission`,
            })),
            // Additional system-wide permissions
            {
                name: "Full System Access",
                key: "system.full_access",
                module: "System",
                description: "Complete access to all system features",
            },
            {
                name: "Database Management",
                key: "system.database",
                module: "System",
                description: "Full database access and management",
            },
            {
                name: "User Management",
                key: "system.users",
                module: "System",
                description: "Manage all users and their permissions",
            },
            {
                name: "Role Management",
                key: "system.roles",
                module: "System",
                description: "Manage all roles and permissions",
            },
            {
                name: "System Configuration",
                key: "system.config",
                module: "System",
                description: "Configure system settings and parameters",
            },
            {
                name: "Audit Logs",
                key: "system.audit",
                module: "System",
                description: "Access to all audit logs and activities",
            },
            {
                name: "API Management",
                key: "system.api",
                module: "System",
                description: "Manage API endpoints and access",
            },
            {
                name: "Security Management",
                key: "system.security",
                module: "System",
                description: "Manage security settings and policies",
            },
            {
                name: "Backup & Restore",
                key: "system.backup",
                module: "System",
                description: "System backup and restore operations",
            },
            {
                name: "Performance Monitoring",
                key: "system.monitoring",
                module: "System",
                description: "Monitor system performance and health",
            },
        ];
        console.log(`📋 Creating ${superAdminPermissions.length} Super Admin permissions...`);
        // Create Super Admin permissions
        for (const perm of superAdminPermissions) {
            await prisma_1.prisma.superAdminPermission.upsert({
                where: { key: perm.key },
                update: perm,
                create: perm,
            });
        }
        console.log("✅ Super Admin permissions created");
        // Create Super Admin role
        const superAdminRole = await prisma_1.prisma.superAdminRole.upsert({
            where: { name: "Super Admin" },
            update: {
                name: "Super Admin",
                description: "Complete system access with all permissions",
            },
            create: {
                name: "Super Admin",
                description: "Complete system access with all permissions",
            },
        });
        console.log("✅ Super Admin role created");
        // Assign all permissions to Super Admin role
        const allSuperAdminPermissions = await prisma_1.prisma.superAdminPermission.findMany();
        for (const permission of allSuperAdminPermissions) {
            await prisma_1.prisma.superAdminRolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: superAdminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: superAdminRole.id,
                    permissionId: permission.id,
                },
            });
        }
        console.log(`✅ All ${allSuperAdminPermissions.length} permissions assigned to Super Admin role`);
        // Create Super Admin user
        const hashedPassword = await bcryptjs_1.default.hash("SuperAdmin123!", 10);
        const superAdminUser = await prisma_1.prisma.superAdmin.upsert({
            where: { email: "superadmin@weconnect.com" },
            update: {
                email: "superadmin@weconnect.com",
                password: hashedPassword,
                firstName: "Super",
                lastName: "Admin",
                isActive: true,
            },
            create: {
                email: "superadmin@weconnect.com",
                password: hashedPassword,
                firstName: "Super",
                lastName: "Admin",
                isActive: true,
            },
        });
        console.log("✅ Super Admin user created");
        // Assign Super Admin role to user
        await prisma_1.prisma.superAdminRoleAssignment.upsert({
            where: {
                superAdminId_roleId: {
                    superAdminId: superAdminUser.id,
                    roleId: superAdminRole.id,
                },
            },
            update: {},
            create: {
                superAdminId: superAdminUser.id,
                roleId: superAdminRole.id,
            },
        });
        console.log("✅ Super Admin role assigned to user");
        // Log the activity
        await prisma_1.prisma.activity.create({
            data: {
                title: "Super Admin System Initialized",
                description: `Super Admin system created with user "${superAdminUser.firstName} ${superAdminUser.lastName}" with ${allSuperAdminPermissions.length} permissions`,
                type: client_1.ActivityType.SYSTEM_MAINTENANCE,
                icon: "FiShield",
                iconColor: "text-red-600",
                tags: ["System", "Super Admin", "Initialization"],
                superAdminId: superAdminUser.id,
            },
        });
        console.log("✅ Activity logged");
        console.log("\n🎉 Super Admin system seeded successfully!");
        console.log("📧 Email: superadmin@weconnect.com");
        console.log("🔑 Password: SuperAdmin123!");
        console.log(`🔐 Role: Super Admin (${allSuperAdminPermissions.length} permissions)`);
        console.log("🚫 Hidden from regular user interface");
        console.log("\n⚠️  Please change the password after first login!");
    }
    catch (error) {
        console.error("❌ Error seeding Super Admin data:", error);
        throw error;
    }
};
exports.seedSuperAdminData = seedSuperAdminData;
// Run the seeder if called directly
if (require.main === module) {
    (0, exports.seedSuperAdminData)()
        .then(() => {
        console.log("✅ Super Admin seeder completed successfully");
        process.exit(0);
    })
        .catch((error) => {
        console.error("❌ Super Admin seeder failed:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=superAdminSeeder.js.map