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
    const email = process.env.ADMIN_EMAIL || 'admin@weconnect.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    console.log(`Ensuring admin user ${email} with reset password...`);
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
    const perms = await prisma.permission.findMany({ where: { key: { in: permKeys } } });
    for (const p of perms) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: p.id },
        });
    }
    console.log('✅ Permissions attached to Admin role');
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
//# sourceMappingURL=reset-admin.js.map