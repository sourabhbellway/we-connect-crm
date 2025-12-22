import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ExpensesController {
    private readonly service;
    constructor(service: ExpensesService);
    list(page?: string, limit?: string, status?: string, search?: string, submittedBy?: string, startDate?: string, endDate?: string, type?: string, projectId?: string, dealId?: string, leadId?: string, currency?: string, user?: any): Promise<{
        success: boolean;
        data: {
            items: ({
                lead: {
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
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
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
            })[];
            expenses: ({
                lead: {
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
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
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
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
    get(id: string, user?: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            expense: {
                lead: {
                    firstName: string | null;
                    lastName: string | null;
                    id: number;
                    company: string | null;
                } | null;
                deal: {
                    id: number;
                    title: string;
                } | null;
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
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateExpenseDto, user?: any): Promise<{
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
            };
        };
    }>;
    approve(id: string, dto: ApproveExpenseDto): Promise<{
        success: boolean;
        data: {
            expense: {
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
                submittedByUser: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: number;
                };
            } & {
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                category: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                approvedAt: Date | null;
                approvedBy: number | null;
                leadId: number | null;
                dealId: number | null;
                expenseDate: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
