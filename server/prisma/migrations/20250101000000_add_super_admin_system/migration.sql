-- Create Super Admin System Tables
-- This migration adds a completely separate Super Admin system

-- Create super_admins table
CREATE TABLE "super_admins" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profilePicture" TEXT
);

-- Create super_admin_roles table
CREATE TABLE "super_admin_roles" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create super_admin_permissions table
CREATE TABLE "super_admin_permissions" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create super_admin_role_assignments table
CREATE TABLE "super_admin_role_assignments" (
    "id" SERIAL PRIMARY KEY,
    "superAdminId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    CONSTRAINT "super_admin_role_assignments_superAdminId_roleId_key" UNIQUE("superAdminId", "roleId")
);

-- Create super_admin_role_permissions table
CREATE TABLE "super_admin_role_permissions" (
    "id" SERIAL PRIMARY KEY,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    CONSTRAINT "super_admin_role_permissions_roleId_permissionId_key" UNIQUE("roleId", "permissionId")
);

-- Add foreign key constraints
ALTER TABLE "super_admin_role_assignments" ADD CONSTRAINT "super_admin_role_assignments_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "super_admin_role_assignments" ADD CONSTRAINT "super_admin_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "super_admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "super_admin_role_permissions" ADD CONSTRAINT "super_admin_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "super_admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "super_admin_role_permissions" ADD CONSTRAINT "super_admin_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "super_admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add superAdminId column to activities table
ALTER TABLE "activities" ADD COLUMN "superAdminId" INTEGER;
ALTER TABLE "activities" ADD CONSTRAINT "activities_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "super_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "super_admins_email_idx" ON "super_admins"("email");
CREATE INDEX "super_admin_roles_name_idx" ON "super_admin_roles"("name");
CREATE INDEX "super_admin_permissions_key_idx" ON "super_admin_permissions"("key");
CREATE INDEX "super_admin_role_assignments_superAdminId_idx" ON "super_admin_role_assignments"("superAdminId");
CREATE INDEX "super_admin_role_assignments_roleId_idx" ON "super_admin_role_assignments"("roleId");
CREATE INDEX "super_admin_role_permissions_roleId_idx" ON "super_admin_role_permissions"("roleId");
CREATE INDEX "super_admin_role_permissions_permissionId_idx" ON "super_admin_role_permissions"("permissionId");
CREATE INDEX "activities_superAdminId_idx" ON "activities"("superAdminId");
