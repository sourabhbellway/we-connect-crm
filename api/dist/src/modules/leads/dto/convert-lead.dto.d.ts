declare class ContactDataDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    address?: string;
    website?: string;
    notes?: string;
}
declare class CompanyDataDto {
    name?: string;
    domain?: string;
    slug?: string;
    industryId?: number;
}
declare class DealDataDto {
    title?: string;
    description?: string;
    value?: number;
    currency?: string;
    status?: string;
    probability?: number;
    expectedCloseDate?: string;
}
export declare class ConvertLeadDto {
    createContact: boolean;
    createCompany: boolean;
    createDeal: boolean;
    contactData?: ContactDataDto;
    companyData?: CompanyDataDto;
    dealData?: DealDataDto;
}
export {};
