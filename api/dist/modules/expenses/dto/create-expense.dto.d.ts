export declare class CreateExpenseDto {
    expenseDate: string;
    amount: number;
    type: string;
    description?: string;
    remarks?: string;
    receiptUrl?: string;
    submittedBy: number;
    projectId?: number;
    dealId?: number;
    leadId?: number;
    currency?: string;
}
