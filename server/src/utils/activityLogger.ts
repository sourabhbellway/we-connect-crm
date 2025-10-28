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
    console.log("Logging user update activity for:", userData);
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

    userEdited: (
    userData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    updatedBy?: number
  ) => {
    console.log("Logging user update activity for:", userData);
    return logActivity({
      title: "User Edited",
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

  userLogout: (userData: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    return logActivity({
      title: "User Logout",
      description: `${userData.firstName} ${userData.lastName} logged out`,
      type: ActivityType.USER_LOGOUT,
      icon: "FiLogOut",
      iconColor: "text-gray-600",
      tags: ["User", "Logout"],
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

  // Lead follow-up activities
  leadFollowUpCreated: (
    followUpData: {
      leadId: number;
      leadName: string;
      followUpType: string;
      subject: string;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "Follow-up Scheduled",
      description: `Follow-up "${followUpData.subject}" scheduled for lead ${followUpData.leadName}`,
      type: ActivityType.LEAD_FOLLOW_UP_CREATED,
      icon: "FiCalendar",
      iconColor: "text-blue-600",
      tags: ["Lead", "FollowUp", followUpData.followUpType],
      metadata: { leadId: followUpData.leadId, type: followUpData.followUpType },
      userId: createdBy,
    });
  },

  leadFollowUpCompleted: (
    followUpData: {
      leadId: number;
      leadName: string;
      followUpType: string;
      subject: string;
    },
    completedBy?: number
  ) => {
    return logActivity({
      title: "Follow-up Completed",
      description: `Follow-up "${followUpData.subject}" completed for lead ${followUpData.leadName}`,
      type: ActivityType.LEAD_FOLLOW_UP_COMPLETED,
      icon: "FiCheck",
      iconColor: "text-green-600",
      tags: ["Lead", "FollowUp", "Completed"],
      metadata: { leadId: followUpData.leadId, type: followUpData.followUpType },
      userId: completedBy,
    });
  },

  // Communication activities
  communicationLogged: (
    commData: {
      leadId: number;
      communicationType: string;
      direction: string;
    },
    loggedBy?: number
  ) => {
    return logActivity({
      title: "Communication Logged",
      description: `${commData.direction} ${commData.communicationType.toLowerCase()} logged for lead`,
      type: ActivityType.COMMUNICATION_LOGGED,
      icon: commData.communicationType === "CALL" ? "FiPhone" : 
            commData.communicationType === "EMAIL" ? "FiMail" : "FiMessageSquare",
      iconColor: "text-purple-600",
      tags: ["Lead", "Communication", commData.communicationType],
      metadata: { leadId: commData.leadId, type: commData.communicationType, direction: commData.direction },
      userId: loggedBy,
    });
  },

  // Task activities
  taskCreated: (
    taskData: {
      id: number;
      title: string;
      assignedTo: string | null;
      leadId: number | null;
      leadName: string | null;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "Task Created",
      description: `Task "${taskData.title}" created${taskData.assignedTo ? ` for ${taskData.assignedTo}` : ""}${taskData.leadName ? ` (Lead: ${taskData.leadName})` : ""}`,
      type: ActivityType.TASK_CREATED,
      icon: "FiPlus",
      iconColor: "text-blue-600",
      tags: ["Task", "Created", ...(taskData.leadId ? ["Lead"] : [])],
      metadata: { taskId: taskData.id, leadId: taskData.leadId },
      userId: createdBy,
    });
  },

  taskCompleted: (
    taskData: {
      id: number;
      title: string;
      leadId: number | null;
      leadName: string | null;
    },
    completedBy?: number
  ) => {
    return logActivity({
      title: "Task Completed",
      description: `Task "${taskData.title}" completed${taskData.leadName ? ` (Lead: ${taskData.leadName})` : ""}`,
      type: ActivityType.TASK_COMPLETED,
      icon: "FiCheck",
      iconColor: "text-green-600",
      tags: ["Task", "Completed", ...(taskData.leadId ? ["Lead"] : [])],
      metadata: { taskId: taskData.id, leadId: taskData.leadId },
      userId: completedBy,
    });
  },

  // Contact activities
  contactCreated: (
    contactData: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "Contact Created",
      description: `Contact ${contactData.firstName} ${contactData.lastName} (${contactData.email}) created`,
      type: ActivityType.CONTACT_CREATED,
      icon: "FiUser",
      iconColor: "text-green-600",
      tags: ["Contact", "Created"],
      metadata: { contactId: contactData.id, email: contactData.email },
      userId: createdBy,
    });
  },

  // Deal activities
  dealCreated: (
    dealData: {
      id: number;
      title: string;
      value: any;
      contactId: number | null;
      contactName: string | null;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "Deal Created",
      description: `Deal "${dealData.title}" created${dealData.value ? ` (${dealData.value})` : ""}${dealData.contactName ? ` for ${dealData.contactName}` : ""}`,
      type: ActivityType.DEAL_CREATED,
      icon: "FiDollarSign",
      iconColor: "text-green-600",
      tags: ["Deal", "Created"],
      metadata: { dealId: dealData.id, value: dealData.value, contactId: dealData.contactId },
      userId: createdBy,
    });
  },

  dealWon: (
    dealData: {
      id: number;
      title: string;
      value: any;
      contactName: string | null;
    },
    wonBy?: number
  ) => {
    return logActivity({
      title: "Deal Won",
      description: `Deal "${dealData.title}" won${dealData.value ? ` (${dealData.value})` : ""}${dealData.contactName ? ` - ${dealData.contactName}` : ""}`,
      type: ActivityType.DEAL_WON,
      icon: "FiTrendingUp",
      iconColor: "text-green-600",
      tags: ["Deal", "Won", "Success"],
      metadata: { dealId: dealData.id, value: dealData.value },
      userId: wonBy,
    });
  },

  dealLost: (
    dealData: {
      id: number;
      title: string;
      value: any;
      contactName: string | null;
    },
    lostBy?: number
  ) => {
    return logActivity({
      title: "Deal Lost",
      description: `Deal "${dealData.title}" lost${dealData.value ? ` (${dealData.value})` : ""}${dealData.contactName ? ` - ${dealData.contactName}` : ""}`,
      type: ActivityType.DEAL_LOST,
      icon: "FiTrendingDown",
      iconColor: "text-red-600",
      tags: ["Deal", "Lost"],
      metadata: { dealId: dealData.id, value: dealData.value },
      userId: lostBy,
    });
  },

  // Lead conversion activity
  leadConverted: (
    conversionData: {
      leadId: number;
      leadName: string;
      contactId: number;
      dealId?: number;
    },
    convertedBy?: number
  ) => {
    return logActivity({
      title: "Lead Converted",
      description: `Lead ${conversionData.leadName} converted to contact${conversionData.dealId ? " and deal" : ""}`,
      type: ActivityType.LEAD_CONVERTED,
      icon: "FiRepeat",
      iconColor: "text-purple-600",
      tags: ["Lead", "Converted", "Contact", ...(conversionData.dealId ? ["Deal"] : [])],
      metadata: { 
        leadId: conversionData.leadId, 
        contactId: conversionData.contactId,
        dealId: conversionData.dealId
      },
      userId: convertedBy,
    });
  },

  // Company activities
  companyCreated: (
    companyData: {
      id: number;
      name: string;
    },
    createdBy?: number
  ) => {
    return logActivity({
      title: "Company Created",
      description: `Company ${companyData.name} was created`,
      type: ActivityType.CONTACT_CREATED, // Using available type, consider adding COMPANY_CREATED
      icon: "FiPlus",
      iconColor: "text-blue-600",
      tags: ["Company", "Created"],
      metadata: { companyId: companyData.id, name: companyData.name },
      userId: createdBy,
    });
  },
};
