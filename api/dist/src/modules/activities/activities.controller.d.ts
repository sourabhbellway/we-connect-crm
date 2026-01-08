import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesController {
    private readonly service;
    constructor(service: ActivitiesService);
    getRecent(limit?: string, userId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
            }[];
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            totalCount: number;
            todayCount: number;
            weekCount: number;
            monthCount: number;
        };
    }>;
    getDeletedData(page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            users: {
                records: {
                    id: number;
                    email: string;
                    emailVerificationToken: string | null;
                    passwordResetToken: string | null;
                    password: string;
                    firstName: string;
                    lastName: string;
                    isActive: boolean;
                    lastLogin: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    profilePicture: string | null;
                    companyId: number | null;
                    deletedAt: Date | null;
                    accountLockedUntil: Date | null;
                    emailVerified: boolean;
                    emailVerifiedAt: Date | null;
                    failedLoginAttempts: number;
                    passwordResetExpires: Date | null;
                    twoFactorEnabled: boolean;
                    twoFactorSecret: string | null;
                    deviceToken: string | null;
                    fcmToken: string | null;
                    managerId: number | null;
                    mustChangePassword: boolean;
                    teamId: number | null;
                    language: string;
                    firstNameAr: string | null;
                    lastNameAr: string | null;
                }[];
                total: number;
                pages: number;
            };
            leads: {
                records: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    firstNameAr: string | null;
                    lastNameAr: string | null;
                    notes: string | null;
                    industry: string | null;
                    currency: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    status: import("@prisma/client").$Enums.LeadStatus;
                    sourceId: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    priority: import("@prisma/client").$Enums.LeadPriority;
                    website: string | null;
                    companySize: number | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    leadScore: number | null;
                    address: string | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    preferredContactMethod: string | null;
                    convertedToDealId: number | null;
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    customFields: import("@prisma/client/runtime/library").JsonValue | null;
                    addressAr: string | null;
                    companyAr: string | null;
                }[];
                total: number;
                pages: number;
            };
            roles: {
                records: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    name: string;
                    description: string | null;
                    accessScope: import("@prisma/client").$Enums.RoleAccessScope;
                }[];
                total: number;
                pages: number;
            };
        };
    }>;
    list(page?: string, limit?: string, type?: string, userId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    create(dto: CreateActivityDto, user?: any): Promise<{
        success: boolean;
        data: {
            activity: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
            };
        };
    }>;
    getActivitiesByLeadId(leadId: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                title: string;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getActivitiesForCalendar(startDate?: string, endDate?: string, user?: any): Promise<{
        success: boolean;
        data: {
            activities: ({
                id: number;
                title: string;
                description: string;
                type: import("@prisma/client").$Enums.ActivityType;
                date: Date | null;
                leadId: number | null;
                userId: number | undefined;
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                } | null;
                source: string;
            } | {
                id: number;
                title: string;
                description: string;
                type: string;
                date: Date | null;
                leadId: number;
                userId: number;
                lead: {
                    id: number;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                };
                user: {
                    id: number;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
                source: string;
            })[];
            total: number;
        };
    }>;
}
