-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "addressAr" TEXT,
ADD COLUMN     "companyAr" TEXT,
ADD COLUMN     "firstNameAr" TEXT,
ADD COLUMN     "lastNameAr" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstNameAr" TEXT,
ADD COLUMN     "lastNameAr" TEXT;
