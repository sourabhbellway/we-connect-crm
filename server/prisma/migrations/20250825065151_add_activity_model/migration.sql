-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('USER_REGISTRATION', 'USER_LOGIN', 'USER_LOGOUT', 'ROLE_UPDATE', 'PERMISSION_UPDATE', 'LEAD_CREATED', 'LEAD_UPDATED', 'LEAD_DELETED', 'SYSTEM_BACKUP', 'SYSTEM_MAINTENANCE', 'SECURITY_ALERT', 'DATABASE_MIGRATION', 'API_CALL', 'ERROR_LOG');

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'FiUser',
    "iconColor" TEXT NOT NULL DEFAULT 'text-blue-600',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
