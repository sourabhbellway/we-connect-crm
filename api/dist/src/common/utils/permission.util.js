"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleBasedWhereClause = getRoleBasedWhereClause;
exports.getAccessibleUserIds = getAccessibleUserIds;
const client_1 = require("@prisma/client");
async function getRoleBasedWhereClause(userId, prisma, fields = ['assignedTo', 'createdBy']) {
    const accessibleIds = await getAccessibleUserIds(userId, prisma);
    if (accessibleIds === null)
        return {};
    const orConditions = fields.map(field => ({
        [field]: { in: accessibleIds }
    }));
    return {
        OR: orConditions
    };
}
async function getAccessibleUserIds(userId, prisma) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: { include: { role: true } },
            managedTeams: {
                include: {
                    members: {
                        select: { id: true }
                    }
                }
            },
            subordinates: {
                select: { id: true }
            },
            team: {
                include: {
                    manager: {
                        select: { id: true }
                    },
                    members: {
                        select: { id: true }
                    }
                }
            }
        },
    });
    if (!user)
        return [userId];
    const roles = user.roles.map((ur) => ur.role);
    const hasGlobal = roles.some((r) => r.accessScope === client_1.RoleAccessScope.GLOBAL);
    if (hasGlobal)
        return null;
    const hasTeam = roles.some((r) => r.accessScope === client_1.RoleAccessScope.TEAM);
    const accessibleIds = new Set();
    accessibleIds.add(userId);
    if (hasTeam) {
        user.managedTeams.forEach((team) => {
            team.members.forEach((m) => accessibleIds.add(m.id));
        });
        user.subordinates.forEach((sub) => {
            accessibleIds.add(sub.id);
        });
        if (user.team && user.team.managerId === userId) {
            user.team.members.forEach((m) => accessibleIds.add(m.id));
        }
    }
    return Array.from(accessibleIds);
}
//# sourceMappingURL=permission.util.js.map