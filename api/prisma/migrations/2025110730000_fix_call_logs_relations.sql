-- Create CallLogs table with proper structure
CREATE TABLE "CallLogs" (
  id SERIAL PRIMARY KEY,
  leadId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  callType VARCHAR(10) NOT NULL DEFAULT 'OUTBOUND' CHECK (callType IN ('INBOUND', 'OUTBOUND')),
  callStatus VARCHAR(15) NOT NULL DEFAULT 'INITIATED' CHECK (callStatus IN ('INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELLED')),
  duration INTEGER,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  notes TEXT,
  outcome VARCHAR(255),
  recordingUrl VARCHAR(255),
  isAnswered BOOLEAN DEFAULT false,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "idx_call_logs_leadId" ON "CallLogs"(leadId);
CREATE INDEX "idx_call_logs_userId" ON "CallLogs"(userId);
CREATE INDEX "idx_call_logs_createdAt" ON "CallLogs"(createdAt DESC);
CREATE INDEX "idx_call_logs_status" ON "CallLogs"(callStatus);

-- Add foreign key constraints if tables don't exist
DO $$ BEGIN
  ALTER TABLE "CallLogs"
    ADD CONSTRAINT "fk_call_logs_lead"
    FOREIGN KEY (leadId) REFERENCES "Leads"(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN RAISE NOTICE 'Foreign key constraint already exists';
END;

DO $$ BEGIN
  ALTER TABLE "CallLogs"
    ADD CONSTRAINT "fk_call_logs_user"
    FOREIGN KEY (userId) REFERENCES "Users"(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN RAISE NOTICE 'Foreign key constraint already exists';
END;
