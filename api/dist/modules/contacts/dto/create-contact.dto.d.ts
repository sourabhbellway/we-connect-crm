export declare class CreateContactDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    notes?: string;
    assignedTo?: number | null;
    companyId?: number | null;
}
