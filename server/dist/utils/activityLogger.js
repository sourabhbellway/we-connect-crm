"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLoggers = exports.logActivity = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const logActivity = async (activityData) => {
    try {
        await prisma.activity.create({
            data: {
                title: activityData.title,
                description: activityData.description,
                type: activityData.type,
                icon: activityData.icon || "FiActivity",
                iconColor: activityData.iconColor || "text-blue-600",
                tags: activityData.tags || [],
                metadata: activityData.metadata || {},
                userId: activityData.userId || null,
            },
        });
    }
    catch (error) {
        console.error("Error logging activity:", error);
        // Don't throw error to avoid breaking the main operation
    }
};
exports.logActivity = logActivity;
// Predefined activity loggers for common actions
exports.activityLoggers = {
    // User activities
    userCreated: (userData, createdBy) => {
        return (0, exports.logActivity)({
            title: "New User Created",
            description: `${userData.firstName} ${userData.lastName} (${userData.email}) was created`,
            type: client_2.ActivityType.USER_REGISTRATION,
            icon: "FiUser",
            iconColor: "text-blue-600",
            tags: ["User", "Creation"],
            metadata: { userId: userData.id, email: userData.email },
            userId: createdBy,
        });
    },
    userUpdated: (userData, updatedBy) => {
        console.log("Logging user update activity for:", userData);
        return (0, exports.logActivity)({
            title: "User Updated",
            description: `${userData.firstName} ${userData.lastName} (${userData.email}) was updated`,
            type: client_2.ActivityType.USER_REGISTRATION, // Consider adding USER_UPDATE to enum later
            icon: "FiEdit",
            iconColor: "text-orange-600",
            tags: ["User", "Update"],
            metadata: { userId: userData.id, email: userData.email },
            userId: updatedBy,
        });
    },
    userEdited: (userData, updatedBy) => {
        console.log("Logging user update activity for:", userData);
        return (0, exports.logActivity)({
            title: "User Edited",
            description: `${userData.firstName} ${userData.lastName} (${userData.email}) was updated`,
            type: client_2.ActivityType.USER_REGISTRATION, // Consider adding USER_UPDATE to enum later
            icon: "FiEdit",
            iconColor: "text-orange-600",
            tags: ["User", "Update"],
            metadata: { userId: userData.id, email: userData.email },
            userId: updatedBy,
        });
    },
    userDeleted: (userData, deletedBy) => {
        return (0, exports.logActivity)({
            title: "User Deleted",
            description: `${userData.firstName} ${userData.lastName} (${userData.email}) was deleted`,
            type: client_2.ActivityType.USER_REGISTRATION, // Consider adding USER_DELETE to enum later
            icon: "FiTrash2",
            iconColor: "text-red-600",
            tags: ["User", "Deletion"],
            metadata: { userId: userData.id, email: userData.email },
            userId: deletedBy,
        });
    },
    userLogin: (userData) => {
        return (0, exports.logActivity)({
            title: "User Login",
            description: `${userData.firstName} ${userData.lastName} logged in`,
            type: client_2.ActivityType.USER_LOGIN,
            icon: "FiLogIn",
            iconColor: "text-green-600",
            tags: ["User", "Login"],
            metadata: { userId: userData.id, email: userData.email },
            userId: userData.id,
        });
    },
    // Lead activities
    leadCreated: (leadData, createdBy) => {
        return (0, exports.logActivity)({
            title: "New Lead Created",
            description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was created`,
            type: client_2.ActivityType.LEAD_CREATED,
            icon: "FiPlus",
            iconColor: "text-green-600",
            tags: ["Lead", "Creation"],
            metadata: { leadId: leadData.id, email: leadData.email },
            userId: createdBy,
        });
    },
    leadUpdated: (leadData, updatedBy) => {
        return (0, exports.logActivity)({
            title: "Lead Updated",
            description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was updated`,
            type: client_2.ActivityType.LEAD_UPDATED,
            icon: "FiEdit",
            iconColor: "text-blue-600",
            tags: ["Lead", "Update"],
            metadata: { leadId: leadData.id, email: leadData.email },
            userId: updatedBy,
        });
    },
    leadDeleted: (leadData, deletedBy) => {
        return (0, exports.logActivity)({
            title: "Lead Deleted",
            description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was deleted`,
            type: client_2.ActivityType.LEAD_DELETED,
            icon: "FiTrash2",
            iconColor: "text-red-600",
            tags: ["Lead", "Deletion"],
            metadata: { leadId: leadData.id, email: leadData.email },
            userId: deletedBy,
        });
    },
    // System activities
    systemBackup: () => {
        return (0, exports.logActivity)({
            title: "System Backup Completed",
            description: "Daily backup process finished successfully",
            type: client_2.ActivityType.SYSTEM_BACKUP,
            icon: "FiDatabase",
            iconColor: "text-green-600",
            tags: ["System", "Backup"],
        });
    },
    securityAlert: (description) => {
        return (0, exports.logActivity)({
            title: "Security Alert",
            description,
            type: client_2.ActivityType.SECURITY_ALERT,
            icon: "FiAlertCircle",
            iconColor: "text-red-600",
            tags: ["Security", "Alert"],
        });
    },
    databaseMigration: (description) => {
        return (0, exports.logActivity)({
            title: "Database Migration",
            description,
            type: client_2.ActivityType.DATABASE_MIGRATION,
            icon: "FiDatabase",
            iconColor: "text-purple-600",
            tags: ["Database", "Migration"],
        });
    },
    // Role activities (use ROLE_UPDATE for create/update/delete summaries)
    roleChanged: (action, role, byUserId) => {
        return (0, exports.logActivity)({
            title: `Role ${action}`,
            description: `Role ${role.name} (${role.id}) ${action.toLowerCase()}`,
            type: client_2.ActivityType.ROLE_UPDATE,
            icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
            iconColor: action === "DELETED" ? "text-red-600" : "text-orange-600",
            tags: ["Role", action],
            metadata: { roleId: role.id, name: role.name, action },
            userId: byUserId,
        });
    },
    // Permission activities
    permissionChanged: (action, payload, byUserId) => {
        return (0, exports.logActivity)({
            title: `Permission ${action}`,
            description: `Permission change: ${action.toLowerCase()}`,
            type: client_2.ActivityType.PERMISSION_UPDATE,
            icon: "FiShield",
            iconColor: "text-purple-600",
            tags: ["Permission", action],
            metadata: payload,
            userId: byUserId,
        });
    },
    // Tag activities
    tagChanged: (action, tag, byUserId) => {
        return (0, exports.logActivity)({
            title: `Tag ${action}`,
            description: `Tag ${tag.name} (${tag.id}) ${action.toLowerCase()}`,
            type: client_2.ActivityType.API_CALL,
            icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
            iconColor: action === "DELETED" ? "text-red-600" : "text-blue-600",
            tags: ["Tag", action],
            metadata: { tagId: tag.id, name: tag.name, action },
            userId: byUserId,
        });
    },
    // Lead source activities
    leadSourceChanged: (action, source, byUserId) => {
        return (0, exports.logActivity)({
            title: `Lead Source ${action}`,
            description: `Lead source ${source.name} (${source.id}) ${action.toLowerCase()}`,
            type: client_2.ActivityType.API_CALL,
            icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
            iconColor: action === "DELETED" ? "text-red-600" : "text-blue-600",
            tags: ["LeadSource", action],
            metadata: { leadSourceId: source.id, name: source.name, action },
            userId: byUserId,
        });
    },
};
//# sourceMappingURL=activityLogger.js.map