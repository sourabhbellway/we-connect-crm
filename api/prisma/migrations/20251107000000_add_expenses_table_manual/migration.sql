-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('TRAVEL', 'MEALS', 'ACCOMMODATION', 'OFFICE_SUPPLIES', 'UTILITIES', 'MARKETING', 'ENTERTAINMENT', 'TRAINING', 'EQUIPMENT', 'SOFTWARE', 'CONSULTING', 'MISCELLANEOUS', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "remarks" TEXT,
    "receiptUrl" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "submittedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "rejectedBy" INTEGER,
    "approvalRemarks" TEXT,
    "projectId" INTEGER,
    "dealId" INTEGER,
    "leadId" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_submittedBy_idx" ON "expenses"("submittedBy");

-- CreateIndex
CREATE INDEX "expenses_approvedBy_idx" ON "expenses"("approvedBy");

-- CreateIndex
CREATE INDEX "expenses_rejectedBy_idx" ON "expenses"("rejectedBy");

-- CreateIndex
CREATE INDEX "expenses_dealId_idx" ON "expenses"("dealId");

-- CreateIndex
CREATE INDEX "expenses_leadId_idx" ON "expenses"("leadId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

