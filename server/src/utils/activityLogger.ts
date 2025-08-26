import { PrismaClient } from "@prisma/client";
import { ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

export interface ActivityLogData {
  title: string;
  description: string;
  type: ActivityType;
  icon?: string;
  iconColor?: string;
  tags?: string[];
  metadata?: any;
  userId?: number;
}

export const logActivity = async (activityData: ActivityLogData) => {
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
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Predefined activity loggers for common actions
export const activityLoggers = {
  // User activities
  userCreated: (
    userData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "New User Created",
      description: `${userData.firstName} ${userData.lastName} (${userData.email}) was created`,
      type: ActivityType.USER_REGISTRATION,
      icon: "FiUser",
      iconColor: "text-blue-600",
      tags: ["User", "Creation"],
      metadata: { userId: userData.id, email: userData.email },
      userId: createdBy,
    });
  },

  userUpdated: (
    userData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    updatedBy?: number
  ) => {
    return logActivity({
      title: "User Updated",
      description: `${userData.firstName} ${userData.lastName} (${userData.email}) was updated`,
      type: ActivityType.USER_REGISTRATION, // Consider adding USER_UPDATE to enum later
      icon: "FiEdit",
      iconColor: "text-orange-600",
      tags: ["User", "Update"],
      metadata: { userId: userData.id, email: userData.email },
      userId: updatedBy,
    });
  },

  userDeleted: (
    userData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    deletedBy?: number
  ) => {
    return logActivity({
      title: "User Deleted",
      description: `${userData.firstName} ${userData.lastName} (${userData.email}) was deleted`,
      type: ActivityType.USER_REGISTRATION, // Consider adding USER_DELETE to enum later
      icon: "FiTrash2",
      iconColor: "text-red-600",
      tags: ["User", "Deletion"],
      metadata: { userId: userData.id, email: userData.email },
      userId: deletedBy,
    });
  },

  userLogin: (userData: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    return logActivity({
      title: "User Login",
      description: `${userData.firstName} ${userData.lastName} logged in`,
      type: ActivityType.USER_LOGIN,
      icon: "FiLogIn",
      iconColor: "text-green-600",
      tags: ["User", "Login"],
      metadata: { userId: userData.id, email: userData.email },
      userId: userData.id,
    });
  },

  // Lead activities
  leadCreated: (
    leadData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "New Lead Created",
      description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was created`,
      type: ActivityType.LEAD_CREATED,
      icon: "FiPlus",
      iconColor: "text-green-600",
      tags: ["Lead", "Creation"],
      metadata: { leadId: leadData.id, email: leadData.email },
      userId: createdBy,
    });
  },

  leadUpdated: (
    leadData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    updatedBy?: number
  ) => {
    return logActivity({
      title: "Lead Updated",
      description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was updated`,
      type: ActivityType.LEAD_UPDATED,
      icon: "FiEdit",
      iconColor: "text-blue-600",
      tags: ["Lead", "Update"],
      metadata: { leadId: leadData.id, email: leadData.email },
      userId: updatedBy,
    });
  },

  leadDeleted: (
    leadData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    deletedBy?: number
  ) => {
    return logActivity({
      title: "Lead Deleted",
      description: `Lead ${leadData.firstName} ${leadData.lastName} (${leadData.email}) was deleted`,
      type: ActivityType.LEAD_DELETED,
      icon: "FiTrash2",
      iconColor: "text-red-600",
      tags: ["Lead", "Deletion"],
      metadata: { leadId: leadData.id, email: leadData.email },
      userId: deletedBy,
    });
  },

  // System activities
  systemBackup: () => {
    return logActivity({
      title: "System Backup Completed",
      description: "Daily backup process finished successfully",
      type: ActivityType.SYSTEM_BACKUP,
      icon: "FiDatabase",
      iconColor: "text-green-600",
      tags: ["System", "Backup"],
    });
  },

  securityAlert: (description: string) => {
    return logActivity({
      title: "Security Alert",
      description,
      type: ActivityType.SECURITY_ALERT,
      icon: "FiAlertCircle",
      iconColor: "text-red-600",
      tags: ["Security", "Alert"],
    });
  },

  databaseMigration: (description: string) => {
    return logActivity({
      title: "Database Migration",
      description,
      type: ActivityType.DATABASE_MIGRATION,
      icon: "FiDatabase",
      iconColor: "text-purple-600",
      tags: ["Database", "Migration"],
    });
  },

  // Role activities (use ROLE_UPDATE for create/update/delete summaries)
  roleChanged: (
    action: "CREATED" | "UPDATED" | "DELETED",
    role: { id: number; name: string },
    byUserId?: number
  ) => {
    return logActivity({
      title: `Role ${action}`,
      description: `Role ${role.name} (${role.id}) ${action.toLowerCase()}`,
      type: ActivityType.ROLE_UPDATE,
      icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
      iconColor: action === "DELETED" ? "text-red-600" : "text-orange-600",
      tags: ["Role", action],
      metadata: { roleId: role.id, name: role.name, action },
      userId: byUserId,
    });
  },

  // Permission activities
  permissionChanged: (
    action: "ASSIGNED" | "REVOKED" | "UPDATED",
    payload: any,
    byUserId?: number
  ) => {
    return logActivity({
      title: `Permission ${action}`,
      description: `Permission change: ${action.toLowerCase()}`,
      type: ActivityType.PERMISSION_UPDATE,
      icon: "FiShield",
      iconColor: "text-purple-600",
      tags: ["Permission", action],
      metadata: payload,
      userId: byUserId,
    });
  },

  // Tag activities
  tagChanged: (
    action: "CREATED" | "UPDATED" | "DELETED",
    tag: { id: number; name: string },
    byUserId?: number
  ) => {
    return logActivity({
      title: `Tag ${action}`,
      description: `Tag ${tag.name} (${tag.id}) ${action.toLowerCase()}`,
      type: ActivityType.API_CALL,
      icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
      iconColor: action === "DELETED" ? "text-red-600" : "text-blue-600",
      tags: ["Tag", action],
      metadata: { tagId: tag.id, name: tag.name, action },
      userId: byUserId,
    });
  },

  // Lead source activities
  leadSourceChanged: (
    action: "CREATED" | "UPDATED" | "DELETED",
    source: { id: number; name: string },
    byUserId?: number
  ) => {
    return logActivity({
      title: `Lead Source ${action}`,
      description: `Lead source ${source.name} (${
        source.id
      }) ${action.toLowerCase()}`,
      type: ActivityType.API_CALL,
      icon: action === "DELETED" ? "FiTrash2" : "FiEdit",
      iconColor: action === "DELETED" ? "text-red-600" : "text-blue-600",
      tags: ["LeadSource", action],
      metadata: { leadSourceId: source.id, name: source.name, action },
      userId: byUserId,
    });
  },
};
