import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesController {
    private readonly service;
    constructor(service: ActivitiesService);
    getRecent(limit?: string, userId?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: {
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    lastLogin: Date | null;
                    profilePicture: string | null;
                    companyId: number | null;
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
                    managerId: number | null;
                    teamId: number | null;
                    deviceToken: string | null;
                    fcmToken: string | null;
                }[];
                total: number;
                pages: number;
            };
            leads: {
                records: {
                    industry: string | null;
                    currency: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    email: string | null;
                    firstName: string | null;
                    lastName: string | null;
                    assignedTo: number | null;
                    createdBy: number | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    companyId: number | null;
                    deletedAt: Date | null;
                    notes: string | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    sourceId: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    priority: import(".prisma/client").$Enums.LeadPriority;
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
                    customFields: import("@prisma/client/runtime/library").JsonValue | null;
                    convertedToDealId: number | null;
                    ownerId: number | null;
                    status: string;
                    previousStatus: string | null;
                }[];
                total: number;
                pages: number;
            };
            roles: {
                records: {
                    description: string | null;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    deletedAt: Date | null;
                    accessScope: import(".prisma/client").$Enums.RoleAccessScope;
                }[];
                total: number;
                pages: number;
            };
        };
    }>;
    list(page?: string, limit?: string, type?: string, userId?: string, search?: string, dateFrom?: string, dateTo?: string, user?: any): Promise<{
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
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                title: string;
                description: string;
                type: import(".prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                tags: string[];
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number | null;
                superAdminId: number | null;
                leadId: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
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
                type: import(".prisma/client").$Enums.ActivityType;
                date: Date | null;
                leadId: number | null;
                userId: number | undefined;
                user: any;
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
