"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialData = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
                    in: ["dashboard.read", "user.read", "lead.read", "lead.create"],
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
        const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
        const adminUser = await prisma_1.prisma.user.upsert({
            where: { email: "admin@crm.com" },
            update: {
                email: "admin@crm.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
            },
            create: {
                email: "admin@crm.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
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
        console.log("✅ Initial data seeded successfully");
    }
    catch (error) {
        console.error("❌ Error seeding initial data:", error);
        throw error;
    }
};
exports.seedInitialData = seedInitialData;
//# sourceMappingURL=initialData.js.map