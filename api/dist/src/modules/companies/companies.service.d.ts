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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                slug: string;
            } | null;
            assignedUser: {
                email: string;
                firstName: string;
                lastName: string;
                id: number;
            } | null;
        } & {
            currency: string | null;
            email: string | null;
            description: string | null;
            tags: string[];
            assignedTo: number | null;
            createdBy: number | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            notes: string | null;
            phone: string | null;
            lastContactedAt: Date | null;
            nextFollowUpAt: Date | null;
            website: string | null;
            companySize: import(".prisma/client").$Enums.CompanySize | null;
            annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
            leadScore: number | null;
            address: string | null;
            country: string | null;
            state: string | null;
            city: string | null;
            zipCode: string | null;
            linkedinProfile: string | null;
            timezone: string | null;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeeCount: string | null;
            domain: string | null;
            slug: string | null;
            industryId: number | null;
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
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    slug: string;
                } | null;
                assignedUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                currency: string | null;
                email: string | null;
                description: string | null;
                tags: string[];
                assignedTo: number | null;
                createdBy: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                notes: string | null;
                phone: string | null;
                lastContactedAt: Date | null;
                nextFollowUpAt: Date | null;
                website: string | null;
                companySize: import(".prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                leadScore: number | null;
                address: string | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                linkedinProfile: string | null;
                timezone: string | null;
                status: import(".prisma/client").$Enums.CompanyStatus;
                employeeCount: string | null;
                domain: string | null;
                slug: string | null;
                industryId: number | null;
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
                currency: string | null;
                email: string | null;
                description: string | null;
                tags: string[];
                assignedTo: number | null;
                createdBy: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                notes: string | null;
                phone: string | null;
                lastContactedAt: Date | null;
                nextFollowUpAt: Date | null;
                website: string | null;
                companySize: import(".prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                leadScore: number | null;
                address: string | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                linkedinProfile: string | null;
                timezone: string | null;
                status: import(".prisma/client").$Enums.CompanyStatus;
                employeeCount: string | null;
                domain: string | null;
                slug: string | null;
                industryId: number | null;
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
                currency: string | null;
                email: string | null;
                description: string | null;
                tags: string[];
                assignedTo: number | null;
                createdBy: number | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                notes: string | null;
                phone: string | null;
                lastContactedAt: Date | null;
                nextFollowUpAt: Date | null;
                website: string | null;
                companySize: import(".prisma/client").$Enums.CompanySize | null;
                annualRevenue: import("@prisma/client/runtime/library").Decimal | null;
                leadScore: number | null;
                address: string | null;
                country: string | null;
                state: string | null;
                city: string | null;
                zipCode: string | null;
                linkedinProfile: string | null;
                timezone: string | null;
                status: import(".prisma/client").$Enums.CompanyStatus;
                employeeCount: string | null;
                domain: string | null;
                slug: string | null;
                industryId: number | null;
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
