import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
export declare class ActivitiesController {
    private readonly service;
    constructor(service: ActivitiesService);
    getRecent(limit?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                leadId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            }[];
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            today: number;
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
                    emailVerificationToken: string | null;
                    passwordResetToken: string | null;
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
                }[];
                total: number;
                pages: number;
            };
            leads: {
                records: {
                    industry: string | null;
                    budget: import("@prisma/client/runtime/library").Decimal | null;
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    companyId: number | null;
                    deletedAt: Date | null;
                    notes: string | null;
                    phone: string | null;
                    company: string | null;
                    position: string | null;
                    address: string | null;
                    website: string | null;
                    currency: string | null;
                    status: import("@prisma/client").$Enums.LeadStatus;
                    companySize: number | null;
                    annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                    country: string | null;
                    state: string | null;
                    city: string | null;
                    zipCode: string | null;
                    linkedinProfile: string | null;
                    timezone: string | null;
                    preferredContactMethod: string | null;
                    sourceId: number | null;
                    priority: import("@prisma/client").$Enums.LeadPriority;
                    assignedTo: number | null;
                    leadScore: number | null;
                    lastContactedAt: Date | null;
                    nextFollowUpAt: Date | null;
                    previousStatus: import("@prisma/client").$Enums.LeadStatus | null;
                    convertedToDealId: number | null;
                }[];
                total: number;
                pages: number;
            };
            roles: {
                records: {
                    name: string;
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    description: string | null;
                    accessScope: import("@prisma/client").$Enums.RoleAccessScope;
                }[];
                total: number;
                pages: number;
            };
        };
    }>;
    list(page?: string, limit?: string, type?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                leadId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    create(dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            activity: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                leadId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number | null;
                description: string;
                title: string;
                tags: string[];
                leadId: number | null;
                type: import("@prisma/client").$Enums.ActivityType;
                icon: string;
                iconColor: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                superAdminId: number | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
}
