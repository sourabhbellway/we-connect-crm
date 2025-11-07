import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ExpensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list({ page, limit, status, search, submittedBy, startDate, endDate, type, projectId, dealId, leadId, currency, }: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        submittedBy?: number;
        startDate?: string;
        endDate?: string;
        type?: string;
        projectId?: number;
        dealId?: number;
        leadId?: number;
        currency?: string;
    }): Promise<{
        success: boolean;
        data: {
            items: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            }[];
            expenses: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            }[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getById(id: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            expense: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            };
        };
        message?: undefined;
    }>;
    create(dto: CreateExpenseDto): Promise<{
        success: boolean;
        data: {
            expense: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            };
        };
    }>;
    update(id: number, dto: UpdateExpenseDto): Promise<{
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
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            };
        };
    }>;
    approve(id: number, dto: ApproveExpenseDto): Promise<{
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
                currency: string;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                leadId: number | null;
                type: import("@prisma/client").$Enums.ExpenseType;
                category: string;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                projectId: number | null;
                approvalRemarks: string | null;
                approvedBy: number | null;
                rejectedBy: number | null;
            };
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getStats(userId?: number): Promise<{
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
}
