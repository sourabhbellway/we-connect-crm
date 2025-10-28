export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: number;
    createdBy: number;
    leadId?: number;
    dealId?: number;
    contactId?: number;
}
