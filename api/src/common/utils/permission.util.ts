import { RoleAccessScope } from "@prisma/client";

export async function getRoleBasedWhereClause(userId: number, prisma: any, fields: string[] = ['assignedTo', 'createdBy']) {
    const accessibleIds = await getAccessibleUserIds(userId, prisma);

    if (accessibleIds === null) return {}; // Global access, no filtering needed

    // Construct OR conditions for the specified fields
    const orConditions = fields.map(field => ({
        [field]: { in: accessibleIds }
    }));

    return {
        OR: orConditions
    };
}

export async function getAccessibleUserIds(userId: number, prisma: any): Promise<number[] | null> {
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

    if (!user) return [userId];

    const roles = user.roles.map((ur: any) => ur.role);

    // Determine highest scope
    const hasGlobal = roles.some((r: any) => r.accessScope === RoleAccessScope.GLOBAL);
    if (hasGlobal) return null; // Null means global access

    const hasTeam = roles.some((r: any) => r.accessScope === RoleAccessScope.TEAM);

    const accessibleIds = new Set<number>();
    accessibleIds.add(userId);

    if (hasTeam) {
        // Collect all member IDs from managed teams
        user.managedTeams.forEach((team: any) => {
            team.members.forEach((m: any) => accessibleIds.add(m.id));
        });

        // Collect all IDs from direct subordinates
        user.subordinates.forEach((sub: any) => {
            accessibleIds.add(sub.id);
        });

        // Also include members of the team the user belongs to, if they are the manager
        if (user.team && user.team.managerId === userId) {
            user.team.members.forEach((m: any) => accessibleIds.add(m.id));
        }
    }

    return Array.from(accessibleIds);
}
