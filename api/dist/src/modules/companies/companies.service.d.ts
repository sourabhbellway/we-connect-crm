import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }, user?: any): Promise<{
        success: boolean;
        data: ({
            industry: {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                slug: string;
            } | null;
            assignedUser: {
                email: string;
                firstName: string;
                lastName: string;
                id: number;
            } | null;
        } & {
            email: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            notes: string | null;
            id: number;
            name: string;
            description: string | null;
            currency: string | null;
            employeeCount: string | null;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdBy: number | null;
            phone: string | null;
            website: string | null;
            companySize: import("@prisma/client").$Enums.CompanySize | null;
            annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
            country: string | null;
            state: string | null;
            city: string | null;
            zipCode: string | null;
            address: string | null;
            timezone: string | null;
            linkedinProfile: string | null;
            assignedTo: number | null;
            leadScore: number | null;
            nextFollowUpAt: Date | null;
            tags: string[];
            domain: string | null;
            slug: string | null;
            industryId: number | null;
            lastContactedAt: Date | null;
            alternatePhone: string | null;
            facebookPage: string | null;
            foundedYear: number | null;
            parentCompanyId: number | null;
            twitterHandle: string | null;
        })[];
    }>;
    getById(id: number, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            company: {
                industry: {
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name: string;
                    slug: string;
                } | null;
                assignedUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                email: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                name: string;
                description: string | null;
                currency: string | null;
                employeeCount: string | null;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdBy: number | null;
                phone: string | null;
                website: string | null;
                companySize: import("@prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                address: string | null;
                timezone: string | null;
                linkedinProfile: string | null;
                assignedTo: number | null;
                leadScore: number | null;
                nextFollowUpAt: Date | null;
                tags: string[];
                domain: string | null;
                slug: string | null;
                industryId: number | null;
                lastContactedAt: Date | null;
                alternatePhone: string | null;
                facebookPage: string | null;
                foundedYear: number | null;
                parentCompanyId: number | null;
                twitterHandle: string | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateCompanyDto, userId?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            company: {
                email: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                name: string;
                description: string | null;
                currency: string | null;
                employeeCount: string | null;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdBy: number | null;
                phone: string | null;
                website: string | null;
                companySize: import("@prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                address: string | null;
                timezone: string | null;
                linkedinProfile: string | null;
                assignedTo: number | null;
                leadScore: number | null;
                nextFollowUpAt: Date | null;
                tags: string[];
                domain: string | null;
                slug: string | null;
                industryId: number | null;
                lastContactedAt: Date | null;
                alternatePhone: string | null;
                facebookPage: string | null;
                foundedYear: number | null;
                parentCompanyId: number | null;
                twitterHandle: string | null;
            };
        };
    }>;
    update(id: number, dto: UpdateCompanyDto): Promise<{
        success: boolean;
        message: string;
        data: {
            company: {
                email: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                notes: string | null;
                id: number;
                name: string;
                description: string | null;
                currency: string | null;
                employeeCount: string | null;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdBy: number | null;
                phone: string | null;
                website: string | null;
                companySize: import("@prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                address: string | null;
                timezone: string | null;
                linkedinProfile: string | null;
                assignedTo: number | null;
                leadScore: number | null;
                nextFollowUpAt: Date | null;
                tags: string[];
                domain: string | null;
                slug: string | null;
                industryId: number | null;
                lastContactedAt: Date | null;
                alternatePhone: string | null;
                facebookPage: string | null;
                foundedYear: number | null;
                parentCompanyId: number | null;
                twitterHandle: string | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
