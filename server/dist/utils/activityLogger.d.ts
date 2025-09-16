import { ActivityType } from "@prisma/client";
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
export declare const logActivity: (activityData: ActivityLogData) => Promise<void>;
export declare const activityLoggers: {
    userCreated: (userData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, createdBy?: number) => Promise<void>;
    userUpdated: (userData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, updatedBy?: number) => Promise<void>;
    userEdited: (userData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, updatedBy?: number) => Promise<void>;
    userDeleted: (userData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, deletedBy?: number) => Promise<void>;
    userLogin: (userData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }) => Promise<void>;
    leadCreated: (leadData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, createdBy?: number) => Promise<void>;
    leadUpdated: (leadData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, updatedBy?: number) => Promise<void>;
    leadDeleted: (leadData: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }, deletedBy?: number) => Promise<void>;
    systemBackup: () => Promise<void>;
    securityAlert: (description: string) => Promise<void>;
    databaseMigration: (description: string) => Promise<void>;
    roleChanged: (action: "CREATED" | "UPDATED" | "DELETED", role: {
        id: number;
        name: string;
    }, byUserId?: number) => Promise<void>;
    permissionChanged: (action: "ASSIGNED" | "REVOKED" | "UPDATED", payload: any, byUserId?: number) => Promise<void>;
    tagChanged: (action: "CREATED" | "UPDATED" | "DELETED", tag: {
        id: number;
        name: string;
    }, byUserId?: number) => Promise<void>;
    leadSourceChanged: (action: "CREATED" | "UPDATED" | "DELETED", source: {
        id: number;
        name: string;
    }, byUserId?: number) => Promise<void>;
};
//# sourceMappingURL=activityLogger.d.ts.map