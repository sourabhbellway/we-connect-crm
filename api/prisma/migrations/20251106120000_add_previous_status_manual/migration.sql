-- Add missing previousStatus column to leads table
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "previousStatus" "LeadStatus";

