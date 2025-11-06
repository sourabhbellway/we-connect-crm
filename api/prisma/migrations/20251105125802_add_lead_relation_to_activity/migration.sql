-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "leadId" INTEGER;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
