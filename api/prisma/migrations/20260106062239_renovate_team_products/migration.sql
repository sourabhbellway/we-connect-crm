/*
  Warnings:

  - The `status` column on the `deals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[color]` on the table `lead_sources` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[color]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `lead_sources` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'PROJECT', 'DEPARTMENT', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WorkflowTrigger" AS ENUM ('LEAD_CREATED', 'LEAD_UPDATED', 'LEAD_STATUS_CHANGED', 'LEAD_ASSIGNED', 'DEAL_CREATED', 'DEAL_UPDATED', 'DEAL_STAGE_CHANGED', 'TASK_CREATED', 'TASK_COMPLETED');

-- CreateEnum
CREATE TYPE "WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_CREATED', 'LEAD_UPDATED', 'LEAD_ASSIGNED', 'LEAD_STATUS_CHANGED', 'CLIENT_REPLY', 'PAYMENT_ADDED', 'PAYMENT_UPDATED', 'TASK_ASSIGNED', 'TASK_DUE', 'MEETING_SCHEDULED', 'FOLLOW_UP_DUE', 'DEAL_CREATED', 'DEAL_WON', 'DEAL_LOST', 'QUOTATION_SENT', 'QUOTATION_ACCEPTED', 'INVOICE_SENT', 'INVOICE_PAID', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmailTemplateCategory" AS ENUM ('WELCOME', 'EMAIL_VERIFICATION', 'EMAIL_CHANGE_CONFIRMATION', 'PASSWORD_RESET', 'WELCOME_SERIES', 'ONBOARDING', 'NEWSLETTER', 'MARKETING', 'SYSTEM_NOTIFICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmailTemplateStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EmailCampaignType" AS ENUM ('WELCOME_SERIES', 'ONBOARDING', 'NURTURE_SEQUENCE', 'RE_ENGAGEMENT', 'NEWSLETTER', 'PROMOTIONAL', 'SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmailTriggerType" AS ENUM ('USER_REGISTERED', 'USER_EMAIL_CHANGED', 'LEAD_CREATED', 'LEAD_QUALIFIED', 'DEAL_CREATED', 'DEAL_WON', 'INVOICE_SENT', 'QUOTATION_SENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmailExecutionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "EmailAuditAction" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED', 'PREVIEWED');

-- CreateEnum
CREATE TYPE "EmailAuditStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'DELIVERED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "InternalDealStatus" AS ENUM ('DRAFT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'FILE_UPLOADED';
ALTER TYPE "ActivityType" ADD VALUE 'FILE_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'QUOTATION_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'QUOTATION_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'QUOTATION_SENT';
ALTER TYPE "ActivityType" ADD VALUE 'INVOICE_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'INVOICE_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'INVOICE_SENT';
ALTER TYPE "ActivityType" ADD VALUE 'NOTE_ADDED';
ALTER TYPE "ActivityType" ADD VALUE 'NOTE_UPDATED';

-- AlterEnum
ALTER TYPE "RoleAccessScope" ADD VALUE 'TEAM';

-- DropIndex
DROP INDEX "expenses_approvedBy_idx";

-- DropIndex
DROP INDEX "expenses_dealId_idx";

-- DropIndex
DROP INDEX "expenses_leadId_idx";

-- DropIndex
DROP INDEX "expenses_rejectedBy_idx";

-- DropIndex
DROP INDEX "expenses_submittedBy_idx";

-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "invoiceNumberingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "invoicePad" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
ADD COLUMN     "invoiceSuffix" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "invoiceTemplate" TEXT NOT NULL DEFAULT 'template1',
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "quoteNumberingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quotePad" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "quotePrefix" TEXT NOT NULL DEFAULT 'Q-',
ADD COLUMN     "quoteSuffix" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "createdBy" INTEGER;

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "createdBy" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "lead_sources" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "customFields" JSONB DEFAULT '{}',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "hsnCode" TEXT;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deviceToken" TEXT,
ADD COLUMN     "fcmToken" TEXT,
ADD COLUMN     "managerId" INTEGER,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamId" INTEGER;

-- DropEnum
DROP TYPE "DealStatus";

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_configs" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT,
    "placeholder" TEXT,
    "helpText" TEXT,
    "validation" JSONB,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchangeRate" DECIMAL(15,6) NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EmailTemplateCategory" NOT NULL DEFAULT 'WELCOME',
    "type" "TemplateType" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "variables" JSONB,
    "metadata" JSONB,
    "status" "EmailTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_versions" (
    "id" SERIAL NOT NULL,
    "emailTemplateId" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "variables" JSONB,
    "changeLog" TEXT,
    "status" "EmailTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,

    CONSTRAINT "email_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "EmailCampaignType" NOT NULL DEFAULT 'WELCOME_SERIES',
    "emailTemplateId" INTEGER NOT NULL,
    "triggerType" "EmailTriggerType" NOT NULL DEFAULT 'USER_REGISTERED',
    "triggerData" JSONB,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaign_executions" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "userId" INTEGER,
    "leadId" INTEGER,
    "triggerData" JSONB NOT NULL,
    "status" "EmailExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "email_campaign_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_audit_logs" (
    "id" SERIAL NOT NULL,
    "emailTemplateId" INTEGER,
    "userId" INTEGER,
    "leadId" INTEGER,
    "action" "EmailAuditAction" NOT NULL,
    "status" "EmailAuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "recipient" TEXT,
    "subject" TEXT,
    "content" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_branding" (
    "id" SERIAL NOT NULL,
    "emailTemplateId" INTEGER NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#64748B',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#1F2937',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "signature" TEXT,
    "footerText" TEXT,
    "socialLinks" JSONB,
    "contactInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_localizations" (
    "id" SERIAL NOT NULL,
    "emailTemplateId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "country" TEXT,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "variables" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_localizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "designType" TEXT NOT NULL DEFAULT 'standard',
    "headerContent" TEXT,
    "footerContent" TEXT,
    "termsAndConditions" TEXT,
    "showTax" BOOLEAN NOT NULL DEFAULT true,
    "showDiscount" BOOLEAN NOT NULL DEFAULT true,
    "logoPosition" TEXT NOT NULL DEFAULT 'left',
    "primaryColor" TEXT DEFAULT '#000000',
    "secondaryColor" TEXT DEFAULT '#666666',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "styles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "invoice_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_and_conditions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "terms_and_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budgetType" "BudgetType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "period" "BudgetPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "expenseType" "ExpenseType",
    "projectId" INTEGER,
    "departmentId" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertThreshold" INTEGER NOT NULL DEFAULT 80,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trigger" "WorkflowTrigger" NOT NULL,
    "triggerData" JSONB,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "triggerData" JSONB NOT NULL,
    "status" "WorkflowExecutionStatus" NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB NOT NULL DEFAULT '{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}',
    "doNotDisturbStart" INTEGER,
    "doNotDisturbEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TeamProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "field_configs_entityType_fieldName_key" ON "field_configs"("entityType", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_name_key" ON "currencies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "email_template_versions_emailTemplateId_versionNumber_key" ON "email_template_versions"("emailTemplateId", "versionNumber");

-- CreateIndex
CREATE INDEX "email_campaign_executions_campaignId_idx" ON "email_campaign_executions"("campaignId");

-- CreateIndex
CREATE INDEX "email_campaign_executions_userId_idx" ON "email_campaign_executions"("userId");

-- CreateIndex
CREATE INDEX "email_campaign_executions_leadId_idx" ON "email_campaign_executions"("leadId");

-- CreateIndex
CREATE INDEX "email_audit_logs_emailTemplateId_idx" ON "email_audit_logs"("emailTemplateId");

-- CreateIndex
CREATE INDEX "email_audit_logs_userId_idx" ON "email_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "email_audit_logs_leadId_idx" ON "email_audit_logs"("leadId");

-- CreateIndex
CREATE INDEX "email_audit_logs_createdAt_idx" ON "email_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_branding_emailTemplateId_key" ON "email_branding"("emailTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "email_localizations_emailTemplateId_locale_key" ON "email_localizations"("emailTemplateId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "deal_statuses_name_key" ON "deal_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_name_key" ON "unit_types"("name");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "_TeamProducts_B_index" ON "_TeamProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "lead_sources_color_key" ON "lead_sources"("color");

-- CreateIndex
CREATE UNIQUE INDEX "tags_color_key" ON "tags"("color");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_versions" ADD CONSTRAINT "email_template_versions_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "email_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaign_executions" ADD CONSTRAINT "email_campaign_executions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_audit_logs" ADD CONSTRAINT "email_audit_logs_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_branding" ADD CONSTRAINT "email_branding_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_localizations" ADD CONSTRAINT "email_localizations_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "email_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamProducts" ADD CONSTRAINT "_TeamProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamProducts" ADD CONSTRAINT "_TeamProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
