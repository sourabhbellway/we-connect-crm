export declare class CreateDealDto {
    title: string;
    description?: string;
    value?: number;
    currency?: string;
    status?: string;
    probability?: number;
    expectedCloseDate?: string;
    assignedTo?: number | null;
    contactId?: number | null;
    leadId?: number | null;
    companyId?: number | null;
}
