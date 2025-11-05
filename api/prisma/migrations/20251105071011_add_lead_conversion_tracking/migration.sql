-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "convertedToDealId" INTEGER,
ADD COLUMN     "previousStatus" "LeadStatus";

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
