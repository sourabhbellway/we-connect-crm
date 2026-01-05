import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRecent(limit?: number, user?: any, targetUserId?: number): Promise<{
        success: boolean;
        data: {
            items: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
    getDeletedData({ page, limit, }: {
        page?: number;
        limit?: number;
    }): Promise<{
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
                    deviceToken: string | null;
                    fcmToken: string | null;
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
    list({ page, limit, type, search, userId, }: {
        page?: number;
        limit?: number;
        type?: string;
        search?: string;
        userId?: number;
    }, user?: any): Promise<{
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
    create(dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            activity: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
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
    getActivitiesByLeadId(leadId: number, { page, limit }?: {
        page?: number;
        limit?: number;
    }): Promise<{
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
    getActivitiesForCalendar({ startDate, endDate, }: {
        startDate?: Date;
        endDate?: Date;
    }, user?: any): Promise<{
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
