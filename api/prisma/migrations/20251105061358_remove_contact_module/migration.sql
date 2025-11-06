/*
  Warnings:

  - You are about to drop the column `contactId` on the `deals` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `convertedToContactId` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `contact_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_communications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_followups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contacts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."contact_activities" DROP CONSTRAINT "contact_activities_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contact_activities" DROP CONSTRAINT "contact_activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contact_communications" DROP CONSTRAINT "contact_communications_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contact_communications" DROP CONSTRAINT "contact_communications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contact_followups" DROP CONSTRAINT "contact_followups_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contact_followups" DROP CONSTRAINT "contact_followups_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contacts" DROP CONSTRAINT "contacts_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "public"."contacts" DROP CONSTRAINT "contacts_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contacts" DROP CONSTRAINT "contacts_sourceLeadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."deals" DROP CONSTRAINT "deals_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quotations" DROP CONSTRAINT "quotations_contactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_contactId_fkey";

-- DropIndex
DROP INDEX "public"."leads_convertedToContactId_key";

-- AlterTable
ALTER TABLE "deals" DROP COLUMN "contactId";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "contactId";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "convertedToContactId";

-- AlterTable
ALTER TABLE "quotations" DROP COLUMN "contactId";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "contactId";

-- DropTable
DROP TABLE "public"."contact_activities";

-- DropTable
DROP TABLE "public"."contact_communications";

-- DropTable
DROP TABLE "public"."contact_followups";

-- DropTable
DROP TABLE "public"."contacts";

-- DropEnum
DROP TYPE "public"."ContactActivityType";
