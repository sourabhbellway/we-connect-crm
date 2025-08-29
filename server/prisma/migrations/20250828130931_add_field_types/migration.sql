-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'TIME', 'DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'TOGGLE', 'FILE');

-- CreateTable
CREATE TABLE "public"."industries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."industry_fields" (
    "id" SERIAL NOT NULL,
    "industryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "public"."FieldType" NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_name_key" ON "public"."industries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "industries_slug_key" ON "public"."industries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "industry_fields_industryId_key_key" ON "public"."industry_fields"("industryId", "key");

-- AddForeignKey
ALTER TABLE "public"."industry_fields" ADD CONSTRAINT "industry_fields_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
