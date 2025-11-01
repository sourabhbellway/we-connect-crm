-- CreateEnum
CREATE TYPE "RoleAccessScope" AS ENUM ('OWN', 'GLOBAL');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "accessScope" "RoleAccessScope" NOT NULL DEFAULT 'OWN';
