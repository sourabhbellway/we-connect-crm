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
    }, user?: any): Promise<{
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
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
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
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
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
    getById(id: number, user?: any): Promise<{
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
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
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
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                id: number;
                description: string | null;
                currency: string;
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
            };
        };
    }>;
    approve(id: number, dto: ApproveExpenseDto): Promise<{
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
                type: import("@prisma/client").$Enums.ExpenseType;
                leadId: number | null;
                status: import("@prisma/client").$Enums.ExpenseStatus;
                category: string;
                approvedAt: Date | null;
                approvedBy: number | null;
                dealId: number | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                expenseDate: Date;
                remarks: string | null;
                receiptUrl: string | null;
                submittedBy: number;
                rejectedBy: number | null;
                approvalRemarks: string | null;
                projectId: number | null;
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
