import {
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiCheckSquare,
  FiClock,
  FiShield,
  FiDatabase,
  FiServer,
  FiActivity,
  FiLogIn,
  FiLogOut,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiZap,
} from "react-icons/fi";

// Map activity types to icons
export const getActivityIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    USER_REGISTRATION: FiUser,
    USER_LOGIN: FiLogIn,
    USER_LOGOUT: FiLogOut,
    ROLE_UPDATE: FiEdit,
    PERMISSION_UPDATE: FiShield,
    LEAD_CREATED: FiPlus,
    LEAD_UPDATED: FiEdit,
    LEAD_DELETED: FiTrash2,
    LEAD_STATUS_CHANGED: FiEdit,
    LEAD_ASSIGNED: FiUser,
    LEAD_CONVERTED: FiCheckCircle,
    LEAD_FOLLOW_UP_CREATED: FiClock,
    LEAD_FOLLOW_UP_COMPLETED: FiCheckSquare,
    TASK_CREATED: FiPlus,
    TASK_UPDATED: FiEdit,
    TASK_COMPLETED: FiCheckSquare,
    COMMUNICATION_LOGGED: FiActivity,
    CONTACT_CREATED: FiUser,
    DEAL_CREATED: FiPlus,
    DEAL_UPDATED: FiEdit,
    DEAL_WON: FiCheckCircle,
    DEAL_LOST: FiAlertCircle,
    FILE_UPLOADED: FiPlus,
    FILE_DELETED: FiTrash2,
    QUOTATION_CREATED: FiPlus,
    QUOTATION_UPDATED: FiEdit,
    QUOTATION_SENT: FiActivity,
    INVOICE_CREATED: FiPlus,
    INVOICE_UPDATED: FiEdit,
    INVOICE_SENT: FiActivity,
    NOTE_ADDED: FiPlus,
    NOTE_UPDATED: FiEdit,
    SYSTEM_BACKUP: FiDatabase,
    SYSTEM_MAINTENANCE: FiServer,
    SECURITY_ALERT: FiAlertCircle,
    DATABASE_MIGRATION: FiDatabase,
    API_CALL: FiActivity,
    ERROR_LOG: FiAlertCircle,
    AUTOMATION_EXECUTED: FiZap,
    AUTOMATION_FAILED: FiAlertCircle,
  };

  return iconMap[type] || FiActivity;
};

// Map activity types to icon colors
export const getActivityIconColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    USER_REGISTRATION: "text-blue-600",
    USER_LOGIN: "text-green-600",
    USER_LOGOUT: "text-gray-600",
    ROLE_UPDATE: "text-orange-600",
    PERMISSION_UPDATE: "text-purple-600",
    LEAD_CREATED: "text-green-600",
    LEAD_UPDATED: "text-blue-600",
    LEAD_DELETED: "text-red-600",
    SYSTEM_BACKUP: "text-green-600",
    SYSTEM_MAINTENANCE: "text-yellow-600",
    SECURITY_ALERT: "text-red-600",
    DATABASE_MIGRATION: "text-purple-600",
    API_CALL: "text-blue-600",
    ERROR_LOG: "text-red-600",
    AUTOMATION_EXECUTED: "text-yellow-600",
    AUTOMATION_FAILED: "text-red-600",
  };

  return colorMap[type] || "text-gray-600";
};

// Format time ago
export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
};

// Transform API activity data to component format
export const transformActivityData = (apiActivity: any) => {
  return {
    id: apiActivity.id,
    title: apiActivity.title,
    description: apiActivity.description,
    time: formatTimeAgo(apiActivity.createdAt),
    icon: getActivityIcon(apiActivity.type),
    iconColor: apiActivity.iconColor || getActivityIconColor(apiActivity.type),
    tags: apiActivity.tags || [],
    user: apiActivity.user,
    type: apiActivity.type,
    createdAt: apiActivity.createdAt,
  };
};


export function parseJwt(token?: string): Record<string, any> | null {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
