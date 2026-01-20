-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('SERVICE_LEAD', 'SALES_LEAD');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('FIXED_CUSTOMER', 'ON_CALL_CUSTOMER', 'WALK_IN_CUSTOMER');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMMUNICATION_LOGGED';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "customerType" "CustomerType" DEFAULT 'FIXED_CUSTOMER',
ADD COLUMN     "leadType" "LeadType" DEFAULT 'SALES_LEAD';

-- CreateTable
CREATE TABLE "voip_configurations" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "accountSid" TEXT,
    "authToken" TEXT,
    "regions" TEXT[],
    "defaultRegion" TEXT,
    "enableCallRecording" BOOLEAN NOT NULL DEFAULT false,
    "recordingStorage" TEXT DEFAULT 'none',
    "enableVideoCalls" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "voip_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voip_calls" (
    "id" SERIAL NOT NULL,
    "callId" TEXT NOT NULL,
    "leadId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "callType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "region" TEXT,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "provider" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voip_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeadToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LeadToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "voip_calls_callId_key" ON "voip_calls"("callId");

-- CreateIndex
CREATE INDEX "_LeadToProduct_B_index" ON "_LeadToProduct"("B");

-- AddForeignKey
ALTER TABLE "voip_calls" ADD CONSTRAINT "voip_calls_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voip_calls" ADD CONSTRAINT "voip_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToProduct" ADD CONSTRAINT "_LeadToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToProduct" ADD CONSTRAINT "_LeadToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
