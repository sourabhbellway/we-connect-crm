import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesController {
    private readonly service;
    constructor(service: ActivitiesService);
    getRecent(limit?: string, userId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                description: string;
                userId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                tags: string[];
                title: string;
                leadId: number | null;
                icon: string;
                iconColor: string;
                superAdminId: number | null;
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
                    email: string;
                    password: string;
                    firstName: string;
                    lastName: string;
                    isActive: boolean;
                    lastLogin: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    profilePicture: string | null;
                    deletedAt: Date | null;
                    accountLockedUntil: Date | null;
                    emailVerificationToken: string | null;
                    emailVerified: boolean;
                    emailVerifiedAt: Date | null;
                    failedLoginAttempts: number;
                    passwordResetExpires: Date | null;
                    passwordResetToken: string | null;
                    twoFactorEnabled: boolean;
                    twoFactorSecret: string | null;
                    mustChangePassword: boolean;
                    id: number;
                    companyId: number | null;
                    managerId: number | null;
                    teamId: number | null;
                }[];
                total: number;
                pages: number;
            };
            leads: {
                records: {
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    notes: string | null;
                    id: number;
                    companyId: number | null;
                    industry: string | null;
                    currency: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    status: import("@prisma/client").$Enums.LeadStatus;
                    createdBy: number | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    website: string | null;
                    companySize: number | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    address: string | null;
                    timezone: string | null;
                    linkedinProfile: string | null;
                    sourceId: number | null;
                    priority: import("@prisma/client").$Enums.LeadPriority;
                    assignedTo: number | null;
                    leadScore: number | null;
                    preferredContactMethod: string | null;
                    nextFollowUpAt: Date | null;
                    lastContactedAt: Date | null;
                    customFields: import("@prisma/client/runtime/library").JsonValue | null;
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    convertedToDealId: number | null;
                }[];
                total: number;
                pages: number;
            };
            roles: {
                records: {
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    id: number;
                    name: string;
                    description: string | null;
                    accessScope: import("@prisma/client").$Enums.RoleAccessScope;
                }[];
                total: number;
                pages: number;
            };
        };
    }>;
    list(page?: string, limit?: string, type?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                description: string;
                userId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                tags: string[];
                title: string;
                leadId: number | null;
                icon: string;
                iconColor: string;
                superAdminId: number | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    create(dto: CreateActivityDto, user?: any): Promise<{
        success: boolean;
        data: {
            activity: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                description: string;
                userId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                tags: string[];
                title: string;
                leadId: number | null;
                icon: string;
                iconColor: string;
                superAdminId: number | null;
            };
        };
    }>;
    getActivitiesByLeadId(leadId: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                description: string;
                userId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                tags: string[];
                title: string;
                leadId: number | null;
                icon: string;
                iconColor: string;
                superAdminId: number | null;
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
                userId: number | null;
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
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
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                };
                user: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                source: string;
            })[];
            total: number;
        };
    }>;
}
