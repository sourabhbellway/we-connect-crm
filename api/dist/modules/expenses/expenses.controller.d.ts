import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ExpensesController {
    private readonly service;
    constructor(service: ExpensesService);
    list(page?: string, limit?: string, status?: string, search?: string, submittedBy?: string, startDate?: string, endDate?: string, type?: string, projectId?: string, dealId?: string, leadId?: string, currency?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    firstName: string;
                    lastName: string;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                approvedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                rejectedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            })[];
            expenses: ({
                lead: {
                    firstName: string;
                    lastName: string;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                approvedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                rejectedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            })[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getStats(userId?: string): Promise<{
        success: boolean;
        data: {
            total: {
                count: number;
                amount: number | import("@prisma/client/runtime/library").Decimal;
            };
            pending: {
                count: number;
                amount: number | import("@prisma/client/runtime/library").Decimal;
            };
            approved: {
                count: number;
                amount: number | import("@prisma/client/runtime/library").Decimal;
            };
            rejected: {
                count: number;
                amount: number | import("@prisma/client/runtime/library").Decimal;
            };
        };
    }>;
    get(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            expense: {
                lead: {
                    firstName: string;
                    lastName: string;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                approvedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                rejectedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateExpenseDto): Promise<{
        success: boolean;
        data: {
            expense: {
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            };
        };
    }>;
    update(id: string, dto: UpdateExpenseDto): Promise<{
        success: boolean;
        data: {
            expense: {
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            };
        };
    }>;
    approve(id: string, dto: ApproveExpenseDto): Promise<{
        success: boolean;
        data: {
            expense: {
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
                approvedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
                rejectedByUser: {
                    firstName: string;
                    lastName: string;
                    id: number;
                } | null;
            } & {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                dealId: number | null;
                category: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
                approvedAt: Date | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
