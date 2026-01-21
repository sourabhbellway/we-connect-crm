--
-- PostgreSQL database dump
--

\restrict Jc78e9J3Epw2RV0PvDA6NTn73upouFqC5xaTHC0gXAfPk1EfzcSu2G21dynLivz

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."ActivityType" AS ENUM (
    'USER_REGISTRATION',
    'USER_LOGIN',
    'USER_LOGOUT',
    'ROLE_UPDATE',
    'PERMISSION_UPDATE',
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_DELETED',
    'SYSTEM_BACKUP',
    'SYSTEM_MAINTENANCE',
    'SECURITY_ALERT',
    'DATABASE_MIGRATION',
    'API_CALL',
    'ERROR_LOG',
    'LEAD_ASSIGNED',
    'LEAD_STATUS_CHANGED',
    'LEAD_CONVERTED',
    'LEAD_FOLLOW_UP_CREATED',
    'LEAD_FOLLOW_UP_COMPLETED',
    'TASK_CREATED',
    'TASK_UPDATED',
    'TASK_COMPLETED',
    'COMMUNICATION_LOGGED',
    'CONTACT_CREATED',
    'DEAL_CREATED',
    'DEAL_UPDATED',
    'DEAL_WON',
    'DEAL_LOST',
    'FILE_UPLOADED',
    'FILE_DELETED',
    'QUOTATION_CREATED',
    'QUOTATION_UPDATED',
    'QUOTATION_SENT',
    'INVOICE_CREATED',
    'INVOICE_UPDATED',
    'INVOICE_SENT',
    'NOTE_ADDED',
    'NOTE_UPDATED'
);


ALTER TYPE public."ActivityType" OWNER TO omkardhole;

--
-- Name: BudgetPeriod; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."BudgetPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'HALF_YEARLY',
    'ANNUAL',
    'CUSTOM'
);


ALTER TYPE public."BudgetPeriod" OWNER TO omkardhole;

--
-- Name: BudgetType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."BudgetType" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'ANNUAL',
    'PROJECT',
    'DEPARTMENT',
    'CAMPAIGN'
);


ALTER TYPE public."BudgetType" OWNER TO omkardhole;

--
-- Name: CallStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CallStatus" AS ENUM (
    'INITIATED',
    'RINGING',
    'ANSWERED',
    'COMPLETED',
    'FAILED',
    'BUSY',
    'NO_ANSWER',
    'CANCELLED'
);


ALTER TYPE public."CallStatus" OWNER TO omkardhole;

--
-- Name: CallType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CallType" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."CallType" OWNER TO omkardhole;

--
-- Name: CommunicationType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CommunicationType" AS ENUM (
    'CALL',
    'EMAIL',
    'SMS',
    'MEETING',
    'NOTE'
);


ALTER TYPE public."CommunicationType" OWNER TO omkardhole;

--
-- Name: CompanyActivityType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CompanyActivityType" AS ENUM (
    'CALL',
    'EMAIL',
    'MEETING',
    'VISIT',
    'DEMO',
    'PRESENTATION',
    'FOLLOW_UP',
    'NOTE',
    'QUOTE_SENT',
    'CONTRACT_SENT',
    'PAYMENT_RECEIVED',
    'SUPPORT_TICKET',
    'TRAINING',
    'AUDIT',
    'REVIEW',
    'PARTNERSHIP',
    'OTHER'
);


ALTER TYPE public."CompanyActivityType" OWNER TO omkardhole;

--
-- Name: CompanySize; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CompanySize" AS ENUM (
    'STARTUP',
    'SMALL',
    'MEDIUM',
    'LARGE',
    'ENTERPRISE'
);


ALTER TYPE public."CompanySize" OWNER TO omkardhole;

--
-- Name: CompanyStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CompanyStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PROSPECT',
    'CUSTOMER',
    'PARTNER',
    'COMPETITOR'
);


ALTER TYPE public."CompanyStatus" OWNER TO omkardhole;

--
-- Name: CustomerType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."CustomerType" AS ENUM (
    'FIXED_CUSTOMER',
    'ON_CALL_CUSTOMER',
    'WALK_IN_CUSTOMER'
);


ALTER TYPE public."CustomerType" OWNER TO omkardhole;

--
-- Name: EmailAuditAction; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailAuditAction" AS ENUM (
    'SENT',
    'DELIVERED',
    'OPENED',
    'CLICKED',
    'BOUNCED',
    'COMPLAINED',
    'UNSUBSCRIBED',
    'CREATED',
    'UPDATED',
    'DELETED',
    'APPROVED',
    'REJECTED',
    'PREVIEWED'
);


ALTER TYPE public."EmailAuditAction" OWNER TO omkardhole;

--
-- Name: EmailAuditStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailAuditStatus" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PENDING',
    'DELIVERED',
    'BOUNCED'
);


ALTER TYPE public."EmailAuditStatus" OWNER TO omkardhole;

--
-- Name: EmailCampaignType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailCampaignType" AS ENUM (
    'WELCOME_SERIES',
    'ONBOARDING',
    'NURTURE_SEQUENCE',
    'RE_ENGAGEMENT',
    'NEWSLETTER',
    'PROMOTIONAL',
    'SYSTEM',
    'CUSTOM'
);


ALTER TYPE public."EmailCampaignType" OWNER TO omkardhole;

--
-- Name: EmailExecutionStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailExecutionStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'SKIPPED'
);


ALTER TYPE public."EmailExecutionStatus" OWNER TO omkardhole;

--
-- Name: EmailTemplateCategory; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailTemplateCategory" AS ENUM (
    'WELCOME',
    'EMAIL_VERIFICATION',
    'EMAIL_CHANGE_CONFIRMATION',
    'PASSWORD_RESET',
    'WELCOME_SERIES',
    'ONBOARDING',
    'NEWSLETTER',
    'MARKETING',
    'SYSTEM_NOTIFICATION',
    'CUSTOM'
);


ALTER TYPE public."EmailTemplateCategory" OWNER TO omkardhole;

--
-- Name: EmailTemplateStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailTemplateStatus" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'ACTIVE',
    'ARCHIVED',
    'REJECTED'
);


ALTER TYPE public."EmailTemplateStatus" OWNER TO omkardhole;

--
-- Name: EmailTriggerType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."EmailTriggerType" AS ENUM (
    'USER_REGISTERED',
    'USER_EMAIL_CHANGED',
    'LEAD_CREATED',
    'LEAD_QUALIFIED',
    'DEAL_CREATED',
    'DEAL_WON',
    'INVOICE_SENT',
    'QUOTATION_SENT',
    'CUSTOM'
);


ALTER TYPE public."EmailTriggerType" OWNER TO omkardhole;

--
-- Name: ExpenseStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."ExpenseStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REIMBURSED'
);


ALTER TYPE public."ExpenseStatus" OWNER TO omkardhole;

--
-- Name: ExpenseType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."ExpenseType" AS ENUM (
    'TRAVEL',
    'MEALS',
    'ACCOMMODATION',
    'OFFICE_SUPPLIES',
    'UTILITIES',
    'MARKETING',
    'ENTERTAINMENT',
    'TRAINING',
    'EQUIPMENT',
    'SOFTWARE',
    'CONSULTING',
    'MISCELLANEOUS',
    'OTHER'
);


ALTER TYPE public."ExpenseType" OWNER TO omkardhole;

--
-- Name: FieldType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."FieldType" AS ENUM (
    'TEXT',
    'NUMBER',
    'DATE',
    'TIME',
    'DROPDOWN',
    'MULTI_SELECT',
    'CHECKBOX',
    'TOGGLE',
    'FILE'
);


ALTER TYPE public."FieldType" OWNER TO omkardhole;

--
-- Name: IntegrationAuthType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."IntegrationAuthType" AS ENUM (
    'API_KEY',
    'OAUTH',
    'TOKEN'
);


ALTER TYPE public."IntegrationAuthType" OWNER TO omkardhole;

--
-- Name: IntegrationLogStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."IntegrationLogStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."IntegrationLogStatus" OWNER TO omkardhole;

--
-- Name: InternalDealStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."InternalDealStatus" AS ENUM (
    'DRAFT',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST'
);


ALTER TYPE public."InternalDealStatus" OWNER TO omkardhole;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'VIEWED',
    'PAID',
    'PARTIALLY_PAID',
    'OVERDUE',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO omkardhole;

--
-- Name: LeadImportStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."LeadImportStatus" AS ENUM (
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."LeadImportStatus" OWNER TO omkardhole;

--
-- Name: LeadPriority; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."LeadPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."LeadPriority" OWNER TO omkardhole;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSED',
    'LOST',
    'CONVERTED'
);


ALTER TYPE public."LeadStatus" OWNER TO omkardhole;

--
-- Name: LeadSyncStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."LeadSyncStatus" AS ENUM (
    'SYNCED',
    'PENDING',
    'FAILED',
    'CONFLICT'
);


ALTER TYPE public."LeadSyncStatus" OWNER TO omkardhole;

--
-- Name: LeadType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."LeadType" AS ENUM (
    'SERVICE_LEAD',
    'SALES_LEAD'
);


ALTER TYPE public."LeadType" OWNER TO omkardhole;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."MessageStatus" OWNER TO omkardhole;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."NotificationType" AS ENUM (
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_ASSIGNED',
    'LEAD_STATUS_CHANGED',
    'CLIENT_REPLY',
    'PAYMENT_ADDED',
    'PAYMENT_UPDATED',
    'TASK_ASSIGNED',
    'TASK_DUE',
    'MEETING_SCHEDULED',
    'FOLLOW_UP_DUE',
    'DEAL_CREATED',
    'DEAL_WON',
    'DEAL_LOST',
    'QUOTATION_SENT',
    'QUOTATION_ACCEPTED',
    'INVOICE_SENT',
    'INVOICE_PAID',
    'SYSTEM',
    'COMMUNICATION_LOGGED'
);


ALTER TYPE public."NotificationType" OWNER TO omkardhole;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."ProductType" AS ENUM (
    'PHYSICAL',
    'DIGITAL',
    'SERVICE'
);


ALTER TYPE public."ProductType" OWNER TO omkardhole;

--
-- Name: QuotationStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."QuotationStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'VIEWED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."QuotationStatus" OWNER TO omkardhole;

--
-- Name: RoleAccessScope; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."RoleAccessScope" AS ENUM (
    'OWN',
    'GLOBAL',
    'TEAM'
);


ALTER TYPE public."RoleAccessScope" OWNER TO omkardhole;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO omkardhole;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO omkardhole;

--
-- Name: TemplateType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."TemplateType" AS ENUM (
    'EMAIL',
    'WHATSAPP',
    'SMS'
);


ALTER TYPE public."TemplateType" OWNER TO omkardhole;

--
-- Name: TriggerType; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."TriggerType" AS ENUM (
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_STATUS_CHANGED',
    'LEAD_ASSIGNED',
    'MANUAL'
);


ALTER TYPE public."TriggerType" OWNER TO omkardhole;

--
-- Name: WorkflowExecutionStatus; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."WorkflowExecutionStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'SUCCESS',
    'FAILED',
    'SKIPPED'
);


ALTER TYPE public."WorkflowExecutionStatus" OWNER TO omkardhole;

--
-- Name: WorkflowTrigger; Type: TYPE; Schema: public; Owner: omkardhole
--

CREATE TYPE public."WorkflowTrigger" AS ENUM (
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_STATUS_CHANGED',
    'LEAD_ASSIGNED',
    'DEAL_CREATED',
    'DEAL_UPDATED',
    'DEAL_STAGE_CHANGED',
    'TASK_CREATED',
    'TASK_COMPLETED'
);


ALTER TYPE public."WorkflowTrigger" OWNER TO omkardhole;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _LeadToProduct; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public."_LeadToProduct" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_LeadToProduct" OWNER TO omkardhole;

--
-- Name: _TeamProducts; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public."_TeamProducts" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_TeamProducts" OWNER TO omkardhole;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO omkardhole;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type public."ActivityType" NOT NULL,
    icon text DEFAULT 'FiUser'::text NOT NULL,
    "iconColor" text DEFAULT 'text-blue-600'::text NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer,
    "superAdminId" integer,
    "leadId" integer
);


ALTER TABLE public.activities OWNER TO omkardhole;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO omkardhole;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.budgets (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "budgetType" public."BudgetType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    spent numeric(12,2) DEFAULT 0 NOT NULL,
    period public."BudgetPeriod" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "expenseType" public."ExpenseType",
    "projectId" integer,
    "departmentId" integer,
    currency text DEFAULT 'USD'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "alertThreshold" integer DEFAULT 80 NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.budgets OWNER TO omkardhole;

--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budgets_id_seq OWNER TO omkardhole;

--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.business_settings (
    id integer NOT NULL,
    "companyName" text NOT NULL,
    "companyEmail" text,
    "companyPhone" text,
    "companyAddress" text,
    "companyWebsite" text,
    "companyLogo" text,
    "timeZone" text DEFAULT 'UTC'::text NOT NULL,
    "dateFormat" text DEFAULT 'MM/DD/YYYY'::text NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "passwordMinLength" integer DEFAULT 8 NOT NULL,
    "passwordRequireUpper" boolean DEFAULT true NOT NULL,
    "passwordRequireLower" boolean DEFAULT true NOT NULL,
    "passwordRequireNumber" boolean DEFAULT true NOT NULL,
    "passwordRequireSymbol" boolean DEFAULT false NOT NULL,
    "sessionTimeout" integer DEFAULT 24 NOT NULL,
    "maxLoginAttempts" integer DEFAULT 5 NOT NULL,
    "accountLockDuration" integer DEFAULT 30 NOT NULL,
    "twoFactorRequired" boolean DEFAULT false NOT NULL,
    "emailVerificationRequired" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "leadAutoAssignmentEnabled" boolean DEFAULT false NOT NULL,
    "leadFollowUpReminderDays" integer DEFAULT 3 NOT NULL,
    "metaAdsApiKey" text,
    "metaAdsApiSecret" text,
    "metaAdsEnabled" boolean DEFAULT false NOT NULL,
    "indiamartApiKey" text,
    "indiamartApiSecret" text,
    "indiamartEnabled" boolean DEFAULT false NOT NULL,
    "tradindiaApiKey" text,
    "tradindiaApiSecret" text,
    "tradindiaEnabled" boolean DEFAULT false NOT NULL,
    "gstNumber" text,
    "panNumber" text,
    "cinNumber" text,
    "fiscalYearStart" text,
    industry text,
    "employeeCount" text,
    description text,
    "invoiceNumberingEnabled" boolean DEFAULT true NOT NULL,
    "invoicePad" integer DEFAULT 6 NOT NULL,
    "invoicePrefix" text DEFAULT 'INV-'::text NOT NULL,
    "invoiceSuffix" text DEFAULT ''::text NOT NULL,
    "invoiceTemplate" text DEFAULT 'template1'::text NOT NULL,
    preferences jsonb,
    "quoteNumberingEnabled" boolean DEFAULT true NOT NULL,
    "quotePad" integer DEFAULT 6 NOT NULL,
    "quotePrefix" text DEFAULT 'Q-'::text NOT NULL,
    "quoteSuffix" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.business_settings OWNER TO omkardhole;

--
-- Name: business_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.business_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_settings_id_seq OWNER TO omkardhole;

--
-- Name: business_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.business_settings_id_seq OWNED BY public.business_settings.id;


--
-- Name: call_logs; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.call_logs (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "userId" integer NOT NULL,
    "phoneNumber" text NOT NULL,
    "callType" public."CallType" DEFAULT 'OUTBOUND'::public."CallType" NOT NULL,
    "callStatus" public."CallStatus" DEFAULT 'INITIATED'::public."CallStatus" NOT NULL,
    duration integer,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    notes text,
    outcome text,
    "recordingUrl" text,
    "isAnswered" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.call_logs OWNER TO omkardhole;

--
-- Name: call_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.call_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.call_logs_id_seq OWNER TO omkardhole;

--
-- Name: call_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.call_logs_id_seq OWNED BY public.call_logs.id;


--
-- Name: communication_automations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.communication_automations (
    id integer NOT NULL,
    name text NOT NULL,
    "triggerType" public."TriggerType" NOT NULL,
    "templateId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    conditions jsonb,
    delay integer,
    "companyId" integer,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.communication_automations OWNER TO omkardhole;

--
-- Name: communication_automations_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.communication_automations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_automations_id_seq OWNER TO omkardhole;

--
-- Name: communication_automations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.communication_automations_id_seq OWNED BY public.communication_automations.id;


--
-- Name: communication_messages; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.communication_messages (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "userId" integer NOT NULL,
    "templateId" integer,
    type public."TemplateType" NOT NULL,
    recipient text NOT NULL,
    subject text,
    content text NOT NULL,
    status public."MessageStatus" DEFAULT 'PENDING'::public."MessageStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "externalId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.communication_messages OWNER TO omkardhole;

--
-- Name: communication_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.communication_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_messages_id_seq OWNER TO omkardhole;

--
-- Name: communication_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.communication_messages_id_seq OWNED BY public.communication_messages.id;


--
-- Name: communication_providers; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.communication_providers (
    id integer NOT NULL,
    name text NOT NULL,
    type public."TemplateType" NOT NULL,
    config jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.communication_providers OWNER TO omkardhole;

--
-- Name: communication_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.communication_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_providers_id_seq OWNER TO omkardhole;

--
-- Name: communication_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.communication_providers_id_seq OWNED BY public.communication_providers.id;


--
-- Name: communication_templates; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.communication_templates (
    id integer NOT NULL,
    name text NOT NULL,
    type public."TemplateType" NOT NULL,
    subject text,
    content text NOT NULL,
    variables jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.communication_templates OWNER TO omkardhole;

--
-- Name: communication_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.communication_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_templates_id_seq OWNER TO omkardhole;

--
-- Name: communication_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.communication_templates_id_seq OWNED BY public.communication_templates.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    domain text,
    "isActive" boolean DEFAULT true NOT NULL,
    slug text,
    "industryId" integer,
    address text,
    "alternatePhone" text,
    "annualRevenue" numeric(15,2),
    "assignedTo" integer,
    city text,
    "companySize" public."CompanySize" DEFAULT 'SMALL'::public."CompanySize",
    country text,
    currency text DEFAULT 'USD'::text,
    "deletedAt" timestamp(3) without time zone,
    description text,
    email text,
    "employeeCount" text,
    "facebookPage" text,
    "foundedYear" integer,
    "lastContactedAt" timestamp(3) without time zone,
    "leadScore" integer DEFAULT 0,
    "linkedinProfile" text,
    "nextFollowUpAt" timestamp(3) without time zone,
    notes text,
    "parentCompanyId" integer,
    phone text,
    state text,
    status public."CompanyStatus" DEFAULT 'ACTIVE'::public."CompanyStatus" NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    timezone text DEFAULT 'UTC'::text,
    "twitterHandle" text,
    website text,
    "zipCode" text,
    "createdBy" integer
);


ALTER TABLE public.companies OWNER TO omkardhole;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO omkardhole;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_activities; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.company_activities (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer,
    type public."CompanyActivityType" NOT NULL,
    title text NOT NULL,
    description text,
    duration integer,
    outcome text,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_activities OWNER TO omkardhole;

--
-- Name: company_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.company_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_activities_id_seq OWNER TO omkardhole;

--
-- Name: company_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.company_activities_id_seq OWNED BY public.company_activities.id;


--
-- Name: company_communications; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.company_communications (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    type public."CommunicationType" NOT NULL,
    subject text,
    content text NOT NULL,
    direction text DEFAULT 'outbound'::text NOT NULL,
    status public."MessageStatus" DEFAULT 'PENDING'::public."MessageStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_communications OWNER TO omkardhole;

--
-- Name: company_communications_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.company_communications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_communications_id_seq OWNER TO omkardhole;

--
-- Name: company_communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.company_communications_id_seq OWNED BY public.company_communications.id;


--
-- Name: company_followups; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.company_followups (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "userId" integer NOT NULL,
    type public."CommunicationType" DEFAULT 'NOTE'::public."CommunicationType" NOT NULL,
    subject text NOT NULL,
    notes text,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "reminderSet" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_followups OWNER TO omkardhole;

--
-- Name: company_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.company_followups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_followups_id_seq OWNER TO omkardhole;

--
-- Name: company_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.company_followups_id_seq OWNED BY public.company_followups.id;


--
-- Name: currencies; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.currencies (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    symbol text NOT NULL,
    "exchangeRate" numeric(15,6) DEFAULT 1.0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.currencies OWNER TO omkardhole;

--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.currencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currencies_id_seq OWNER TO omkardhole;

--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.currencies_id_seq OWNED BY public.currencies.id;


--
-- Name: deal_products; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.deal_products (
    id integer NOT NULL,
    "dealId" integer NOT NULL,
    name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.deal_products OWNER TO omkardhole;

--
-- Name: deal_products_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.deal_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deal_products_id_seq OWNER TO omkardhole;

--
-- Name: deal_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.deal_products_id_seq OWNED BY public.deal_products.id;


--
-- Name: deal_statuses; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.deal_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6B7280'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deal_statuses OWNER TO omkardhole;

--
-- Name: deal_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.deal_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deal_statuses_id_seq OWNER TO omkardhole;

--
-- Name: deal_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.deal_statuses_id_seq OWNED BY public.deal_statuses.id;


--
-- Name: deals; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.deals (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    value numeric(65,30) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    probability integer DEFAULT 0 NOT NULL,
    "expectedCloseDate" timestamp(3) without time zone,
    "actualCloseDate" timestamp(3) without time zone,
    "assignedTo" integer,
    "leadId" integer,
    "companyId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdBy" integer,
    status text DEFAULT 'DRAFT'::text NOT NULL
);


ALTER TABLE public.deals OWNER TO omkardhole;

--
-- Name: deals_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.deals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deals_id_seq OWNER TO omkardhole;

--
-- Name: deals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.deals_id_seq OWNED BY public.deals.id;


--
-- Name: email_audit_logs; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_audit_logs (
    id integer NOT NULL,
    "emailTemplateId" integer,
    "userId" integer,
    "leadId" integer,
    action public."EmailAuditAction" NOT NULL,
    status public."EmailAuditStatus" DEFAULT 'SUCCESS'::public."EmailAuditStatus" NOT NULL,
    recipient text,
    subject text,
    content text,
    "errorMessage" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "sentAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "openedAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    "bouncedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_audit_logs OWNER TO omkardhole;

--
-- Name: email_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_audit_logs_id_seq OWNER TO omkardhole;

--
-- Name: email_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_audit_logs_id_seq OWNED BY public.email_audit_logs.id;


--
-- Name: email_branding; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_branding (
    id integer NOT NULL,
    "emailTemplateId" integer NOT NULL,
    "logoUrl" text,
    "primaryColor" text DEFAULT '#3B82F6'::text NOT NULL,
    "secondaryColor" text DEFAULT '#64748B'::text NOT NULL,
    "backgroundColor" text DEFAULT '#FFFFFF'::text NOT NULL,
    "textColor" text DEFAULT '#1F2937'::text NOT NULL,
    "fontFamily" text DEFAULT 'Inter, sans-serif'::text NOT NULL,
    signature text,
    "footerText" text,
    "socialLinks" jsonb,
    "contactInfo" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_branding OWNER TO omkardhole;

--
-- Name: email_branding_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_branding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_branding_id_seq OWNER TO omkardhole;

--
-- Name: email_branding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_branding_id_seq OWNED BY public.email_branding.id;


--
-- Name: email_campaign_executions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_campaign_executions (
    id integer NOT NULL,
    "campaignId" integer NOT NULL,
    "userId" integer,
    "leadId" integer,
    "triggerData" jsonb NOT NULL,
    status public."EmailExecutionStatus" DEFAULT 'PENDING'::public."EmailExecutionStatus" NOT NULL,
    "currentStep" integer DEFAULT 0 NOT NULL,
    "totalSteps" integer NOT NULL,
    result jsonb,
    error text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public.email_campaign_executions OWNER TO omkardhole;

--
-- Name: email_campaign_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_campaign_executions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_campaign_executions_id_seq OWNER TO omkardhole;

--
-- Name: email_campaign_executions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_campaign_executions_id_seq OWNED BY public.email_campaign_executions.id;


--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type public."EmailCampaignType" DEFAULT 'WELCOME_SERIES'::public."EmailCampaignType" NOT NULL,
    "emailTemplateId" integer NOT NULL,
    "triggerType" public."EmailTriggerType" DEFAULT 'USER_REGISTERED'::public."EmailTriggerType" NOT NULL,
    "triggerData" jsonb,
    steps jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.email_campaigns OWNER TO omkardhole;

--
-- Name: email_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_campaigns_id_seq OWNER TO omkardhole;

--
-- Name: email_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_campaigns_id_seq OWNED BY public.email_campaigns.id;


--
-- Name: email_localizations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_localizations (
    id integer NOT NULL,
    "emailTemplateId" integer NOT NULL,
    locale text NOT NULL,
    language text NOT NULL,
    country text,
    subject text NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text NOT NULL,
    variables jsonb,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_localizations OWNER TO omkardhole;

--
-- Name: email_localizations_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_localizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_localizations_id_seq OWNER TO omkardhole;

--
-- Name: email_localizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_localizations_id_seq OWNED BY public.email_localizations.id;


--
-- Name: email_template_versions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_template_versions (
    id integer NOT NULL,
    "emailTemplateId" integer NOT NULL,
    "versionNumber" integer NOT NULL,
    subject text NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text NOT NULL,
    variables jsonb,
    "changeLog" text,
    status public."EmailTemplateStatus" DEFAULT 'DRAFT'::public."EmailTemplateStatus" NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" integer
);


ALTER TABLE public.email_template_versions OWNER TO omkardhole;

--
-- Name: email_template_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_template_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_template_versions_id_seq OWNER TO omkardhole;

--
-- Name: email_template_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_template_versions_id_seq OWNED BY public.email_template_versions.id;


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    name text NOT NULL,
    category public."EmailTemplateCategory" DEFAULT 'WELCOME'::public."EmailTemplateCategory" NOT NULL,
    type public."TemplateType" DEFAULT 'EMAIL'::public."TemplateType" NOT NULL,
    subject text NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text NOT NULL,
    variables jsonb,
    metadata jsonb,
    status public."EmailTemplateStatus" DEFAULT 'DRAFT'::public."EmailTemplateStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "companyId" integer,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" integer,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.email_templates OWNER TO omkardhole;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_templates_id_seq OWNER TO omkardhole;

--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    "expenseDate" timestamp(3) without time zone NOT NULL,
    amount numeric(12,2) NOT NULL,
    type public."ExpenseType" NOT NULL,
    category text NOT NULL,
    description text,
    remarks text,
    "receiptUrl" text,
    status public."ExpenseStatus" DEFAULT 'PENDING'::public."ExpenseStatus" NOT NULL,
    "submittedBy" integer NOT NULL,
    "approvedBy" integer,
    "rejectedBy" integer,
    "approvalRemarks" text,
    "projectId" integer,
    "dealId" integer,
    "leadId" integer,
    currency text DEFAULT 'USD'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone
);


ALTER TABLE public.expenses OWNER TO omkardhole;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_id_seq OWNER TO omkardhole;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: field_configs; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.field_configs (
    id integer NOT NULL,
    "entityType" text NOT NULL,
    "fieldName" text NOT NULL,
    label text NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    section text,
    placeholder text,
    "helpText" text,
    validation jsonb,
    options jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.field_configs OWNER TO omkardhole;

--
-- Name: field_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.field_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.field_configs_id_seq OWNER TO omkardhole;

--
-- Name: field_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.field_configs_id_seq OWNED BY public.field_configs.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.files (
    id integer NOT NULL,
    name text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" integer NOT NULL,
    "uploadedBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.files OWNER TO omkardhole;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO omkardhole;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: industries; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.industries (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.industries OWNER TO omkardhole;

--
-- Name: industries_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.industries_id_seq OWNER TO omkardhole;

--
-- Name: industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.industries_id_seq OWNED BY public.industries.id;


--
-- Name: industry_fields; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.industry_fields (
    id integer NOT NULL,
    "industryId" integer NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    type public."FieldType" DEFAULT 'TEXT'::public."FieldType" NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.industry_fields OWNER TO omkardhole;

--
-- Name: industry_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.industry_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.industry_fields_id_seq OWNER TO omkardhole;

--
-- Name: industry_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.industry_fields_id_seq OWNED BY public.industry_fields.id;


--
-- Name: integration_logs; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.integration_logs (
    id integer NOT NULL,
    "integrationId" integer NOT NULL,
    operation text NOT NULL,
    status public."IntegrationLogStatus" DEFAULT 'PENDING'::public."IntegrationLogStatus" NOT NULL,
    message text,
    data jsonb,
    "errorDetails" text,
    "recordsCount" integer DEFAULT 0,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.integration_logs OWNER TO omkardhole;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.integration_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_logs_id_seq OWNER TO omkardhole;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.integration_logs_id_seq OWNED BY public.integration_logs.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.invoice_items (
    id integer NOT NULL,
    "invoiceId" integer NOT NULL,
    "productId" integer,
    name text NOT NULL,
    description text,
    quantity numeric(10,2) NOT NULL,
    unit text DEFAULT 'pcs'::text,
    "unitPrice" numeric(10,2) NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "discountRate" numeric(5,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO omkardhole;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_items_id_seq OWNER TO omkardhole;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoice_templates; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.invoice_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "designType" text DEFAULT 'standard'::text NOT NULL,
    "headerContent" text,
    "footerContent" text,
    "termsAndConditions" text,
    "showTax" boolean DEFAULT true NOT NULL,
    "showDiscount" boolean DEFAULT true NOT NULL,
    "logoPosition" text DEFAULT 'left'::text NOT NULL,
    "primaryColor" text DEFAULT '#000000'::text,
    "secondaryColor" text DEFAULT '#666666'::text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    styles jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.invoice_templates OWNER TO omkardhole;

--
-- Name: invoice_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.invoice_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_templates_id_seq OWNER TO omkardhole;

--
-- Name: invoice_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.invoice_templates_id_seq OWNED BY public.invoice_templates.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    "invoiceNumber" text NOT NULL,
    title text NOT NULL,
    description text,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    notes text,
    terms text,
    "companyId" integer,
    "leadId" integer,
    "dealId" integer,
    "quotationId" integer,
    "createdBy" integer NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "viewedAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.invoices OWNER TO omkardhole;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_id_seq OWNER TO omkardhole;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: lead_assignment_rules; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_assignment_rules (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    conditions jsonb NOT NULL,
    actions jsonb NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lead_assignment_rules OWNER TO omkardhole;

--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_assignment_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_assignment_rules_id_seq OWNER TO omkardhole;

--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_assignment_rules_id_seq OWNED BY public.lead_assignment_rules.id;


--
-- Name: lead_communications; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_communications (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "userId" integer NOT NULL,
    type public."CommunicationType" NOT NULL,
    subject text,
    content text NOT NULL,
    direction text DEFAULT 'outbound'::text NOT NULL,
    duration integer,
    outcome text,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lead_communications OWNER TO omkardhole;

--
-- Name: lead_communications_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_communications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_communications_id_seq OWNER TO omkardhole;

--
-- Name: lead_communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_communications_id_seq OWNED BY public.lead_communications.id;


--
-- Name: lead_followups; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_followups (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "userId" integer NOT NULL,
    type public."CommunicationType" DEFAULT 'NOTE'::public."CommunicationType" NOT NULL,
    subject text NOT NULL,
    notes text,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "reminderSet" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lead_followups OWNER TO omkardhole;

--
-- Name: lead_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_followups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_followups_id_seq OWNER TO omkardhole;

--
-- Name: lead_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_followups_id_seq OWNED BY public.lead_followups.id;


--
-- Name: lead_import_batches; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_import_batches (
    id integer NOT NULL,
    "fileName" text NOT NULL,
    "totalRows" integer NOT NULL,
    "successRows" integer DEFAULT 0 NOT NULL,
    "failedRows" integer DEFAULT 0 NOT NULL,
    status public."LeadImportStatus" DEFAULT 'PROCESSING'::public."LeadImportStatus" NOT NULL,
    "errorDetails" jsonb,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lead_import_batches OWNER TO omkardhole;

--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_import_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_import_batches_id_seq OWNER TO omkardhole;

--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_import_batches_id_seq OWNED BY public.lead_import_batches.id;


--
-- Name: lead_import_records; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_import_records (
    id integer NOT NULL,
    "batchId" integer NOT NULL,
    "rowIndex" integer NOT NULL,
    "leadId" integer,
    status public."LeadImportStatus" DEFAULT 'PROCESSING'::public."LeadImportStatus" NOT NULL,
    errors jsonb,
    "rawData" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lead_import_records OWNER TO omkardhole;

--
-- Name: lead_import_records_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_import_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_import_records_id_seq OWNER TO omkardhole;

--
-- Name: lead_import_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_import_records_id_seq OWNED BY public.lead_import_records.id;


--
-- Name: lead_integration_sync; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_integration_sync (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "integrationId" integer NOT NULL,
    "externalId" text NOT NULL,
    "externalData" jsonb,
    "syncStatus" public."LeadSyncStatus" DEFAULT 'SYNCED'::public."LeadSyncStatus" NOT NULL,
    "lastSyncAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lead_integration_sync OWNER TO omkardhole;

--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_integration_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_integration_sync_id_seq OWNER TO omkardhole;

--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_integration_sync_id_seq OWNED BY public.lead_integration_sync.id;


--
-- Name: lead_sources; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_sources (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "companyId" integer,
    color text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.lead_sources OWNER TO omkardhole;

--
-- Name: lead_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_sources_id_seq OWNER TO omkardhole;

--
-- Name: lead_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_sources_id_seq OWNED BY public.lead_sources.id;


--
-- Name: lead_tags; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.lead_tags (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public.lead_tags OWNER TO omkardhole;

--
-- Name: lead_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.lead_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_tags_id_seq OWNER TO omkardhole;

--
-- Name: lead_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.lead_tags_id_seq OWNED BY public.lead_tags.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    "firstName" text,
    "lastName" text,
    email text,
    phone text,
    company text,
    "position" text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sourceId" integer,
    "assignedTo" integer,
    "companyId" integer,
    "deletedAt" timestamp(3) without time zone,
    budget numeric(10,2),
    currency text DEFAULT 'USD'::text,
    "lastContactedAt" timestamp(3) without time zone,
    "nextFollowUpAt" timestamp(3) without time zone,
    priority public."LeadPriority" DEFAULT 'MEDIUM'::public."LeadPriority" NOT NULL,
    industry text,
    website text,
    "companySize" integer,
    "annualRevenue" numeric(15,2),
    "leadScore" integer,
    address text,
    country text,
    state text,
    city text,
    "zipCode" text,
    "linkedinProfile" text,
    timezone text,
    "preferredContactMethod" text DEFAULT 'email'::text,
    "convertedToDealId" integer,
    "previousStatus" public."LeadStatus",
    "createdBy" integer,
    "customFields" jsonb DEFAULT '{}'::jsonb,
    "addressAr" text,
    "companyAr" text,
    "firstNameAr" text,
    "lastNameAr" text,
    "customerType" public."CustomerType" DEFAULT 'FIXED_CUSTOMER'::public."CustomerType",
    "leadType" public."LeadType" DEFAULT 'SALES_LEAD'::public."LeadType"
);


ALTER TABLE public.leads OWNER TO omkardhole;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leads_id_seq OWNER TO omkardhole;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: login_sessions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.login_sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    "deviceInfo" text,
    "ipAddress" text,
    "userAgent" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.login_sessions OWNER TO omkardhole;

--
-- Name: login_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.login_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_sessions_id_seq OWNER TO omkardhole;

--
-- Name: login_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.login_sessions_id_seq OWNED BY public.login_sessions.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "leadId" integer NOT NULL,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.notes OWNER TO omkardhole;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO omkardhole;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "inAppEnabled" boolean DEFAULT true NOT NULL,
    "emailEnabled" boolean DEFAULT false NOT NULL,
    "soundEnabled" boolean DEFAULT true NOT NULL,
    preferences jsonb DEFAULT '{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}'::jsonb NOT NULL,
    "doNotDisturbStart" integer,
    "doNotDisturbEnd" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO omkardhole;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_preferences_id_seq OWNER TO omkardhole;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO omkardhole;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO omkardhole;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_history; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.password_history (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_history OWNER TO omkardhole;

--
-- Name: password_history_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.password_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_history_id_seq OWNER TO omkardhole;

--
-- Name: password_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.password_history_id_seq OWNED BY public.password_history.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    "invoiceId" integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "referenceNumber" text,
    notes text,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO omkardhole;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO omkardhole;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    description text,
    module text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO omkardhole;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO omkardhole;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.product_categories OWNER TO omkardhole;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_categories_id_seq OWNER TO omkardhole;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    sku text,
    type public."ProductType" DEFAULT 'PHYSICAL'::public."ProductType" NOT NULL,
    category text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    unit text DEFAULT 'pcs'::text,
    "taxRate" numeric(5,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "stockQuantity" integer DEFAULT 0,
    "minStockLevel" integer DEFAULT 0,
    "maxStockLevel" integer DEFAULT 0,
    image text,
    "companyId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "hsnCode" text
);


ALTER TABLE public.products OWNER TO omkardhole;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO omkardhole;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: proposal_templates; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.proposal_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    content text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "headerHtml" text,
    "footerHtml" text,
    styles jsonb,
    variables jsonb,
    "previewImage" text,
    category text DEFAULT 'business'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.proposal_templates OWNER TO omkardhole;

--
-- Name: proposal_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.proposal_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_templates_id_seq OWNER TO omkardhole;

--
-- Name: proposal_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.proposal_templates_id_seq OWNED BY public.proposal_templates.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.quotation_items (
    id integer NOT NULL,
    "quotationId" integer NOT NULL,
    "productId" integer,
    name text NOT NULL,
    description text,
    quantity numeric(10,2) NOT NULL,
    unit text DEFAULT 'pcs'::text,
    "unitPrice" numeric(10,2) NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "discountRate" numeric(5,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotation_items OWNER TO omkardhole;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotation_items_id_seq OWNER TO omkardhole;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- Name: quotation_templates; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.quotation_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "headerContent" text,
    "footerContent" text,
    "termsAndConditions" text,
    "validityDays" integer DEFAULT 30 NOT NULL,
    "showTax" boolean DEFAULT true NOT NULL,
    "showDiscount" boolean DEFAULT true NOT NULL,
    "logoPosition" text DEFAULT 'left'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    styles jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.quotation_templates OWNER TO omkardhole;

--
-- Name: quotation_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.quotation_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotation_templates_id_seq OWNER TO omkardhole;

--
-- Name: quotation_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.quotation_templates_id_seq OWNED BY public.quotation_templates.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    "quotationNumber" text NOT NULL,
    title text NOT NULL,
    description text,
    status public."QuotationStatus" DEFAULT 'DRAFT'::public."QuotationStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "validUntil" timestamp(3) without time zone,
    notes text,
    terms text,
    "companyId" integer,
    "leadId" integer,
    "dealId" integer,
    "createdBy" integer NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "viewedAt" timestamp(3) without time zone,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.quotations OWNER TO omkardhole;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotations_id_seq OWNER TO omkardhole;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    "userId" integer NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO omkardhole;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.refresh_tokens_id_seq OWNER TO omkardhole;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO omkardhole;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permissions_id_seq OWNER TO omkardhole;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "accessScope" public."RoleAccessScope" DEFAULT 'OWN'::public."RoleAccessScope" NOT NULL
);


ALTER TABLE public.roles OWNER TO omkardhole;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO omkardhole;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: super_admin_permissions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.super_admin_permissions (
    id integer NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    description text,
    module text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.super_admin_permissions OWNER TO omkardhole;

--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.super_admin_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_permissions_id_seq OWNER TO omkardhole;

--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.super_admin_permissions_id_seq OWNED BY public.super_admin_permissions.id;


--
-- Name: super_admin_role_assignments; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.super_admin_role_assignments (
    id integer NOT NULL,
    "superAdminId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.super_admin_role_assignments OWNER TO omkardhole;

--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.super_admin_role_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_role_assignments_id_seq OWNER TO omkardhole;

--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.super_admin_role_assignments_id_seq OWNED BY public.super_admin_role_assignments.id;


--
-- Name: super_admin_role_permissions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.super_admin_role_permissions (
    id integer NOT NULL,
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.super_admin_role_permissions OWNER TO omkardhole;

--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.super_admin_role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_role_permissions_id_seq OWNER TO omkardhole;

--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.super_admin_role_permissions_id_seq OWNED BY public.super_admin_role_permissions.id;


--
-- Name: super_admin_roles; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.super_admin_roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.super_admin_roles OWNER TO omkardhole;

--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.super_admin_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_roles_id_seq OWNER TO omkardhole;

--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.super_admin_roles_id_seq OWNED BY public.super_admin_roles.id;


--
-- Name: super_admins; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.super_admins (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "profilePicture" text
);


ALTER TABLE public.super_admins OWNER TO omkardhole;

--
-- Name: super_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.super_admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admins_id_seq OWNER TO omkardhole;

--
-- Name: super_admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.super_admins_id_seq OWNED BY public.super_admins.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "companyId" integer
);


ALTER TABLE public.tags OWNER TO omkardhole;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO omkardhole;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'PENDING'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "assignedTo" integer,
    "createdBy" integer NOT NULL,
    "leadId" integer,
    "dealId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.tasks OWNER TO omkardhole;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO omkardhole;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: taxes; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.taxes (
    id integer NOT NULL,
    name text NOT NULL,
    rate numeric(5,2) NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.taxes OWNER TO omkardhole;

--
-- Name: taxes_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.taxes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.taxes_id_seq OWNER TO omkardhole;

--
-- Name: taxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.taxes_id_seq OWNED BY public.taxes.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "managerId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO omkardhole;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO omkardhole;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: terms_and_conditions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.terms_and_conditions (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    content text NOT NULL,
    category text DEFAULT 'general'::text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.terms_and_conditions OWNER TO omkardhole;

--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.terms_and_conditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.terms_and_conditions_id_seq OWNER TO omkardhole;

--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.terms_and_conditions_id_seq OWNED BY public.terms_and_conditions.id;


--
-- Name: third_party_integrations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.third_party_integrations (
    id integer NOT NULL,
    name text NOT NULL,
    "displayName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "apiEndpoint" text NOT NULL,
    "authType" public."IntegrationAuthType" DEFAULT 'API_KEY'::public."IntegrationAuthType" NOT NULL,
    config jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.third_party_integrations OWNER TO omkardhole;

--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.third_party_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.third_party_integrations_id_seq OWNER TO omkardhole;

--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.third_party_integrations_id_seq OWNED BY public.third_party_integrations.id;


--
-- Name: unit_types; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.unit_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.unit_types OWNER TO omkardhole;

--
-- Name: unit_types_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.unit_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unit_types_id_seq OWNER TO omkardhole;

--
-- Name: unit_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.unit_types_id_seq OWNED BY public.unit_types.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO omkardhole;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_seq OWNER TO omkardhole;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "profilePicture" text,
    "companyId" integer,
    "deletedAt" timestamp(3) without time zone,
    "accountLockedUntil" timestamp(3) without time zone,
    "emailVerificationToken" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "passwordResetExpires" timestamp(3) without time zone,
    "passwordResetToken" text,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" text,
    "deviceToken" text,
    "fcmToken" text,
    "managerId" integer,
    "mustChangePassword" boolean DEFAULT false NOT NULL,
    "teamId" integer,
    language text DEFAULT 'en'::text NOT NULL,
    "firstNameAr" text,
    "lastNameAr" text
);


ALTER TABLE public.users OWNER TO omkardhole;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO omkardhole;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voip_calls; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.voip_calls (
    id integer NOT NULL,
    "callId" text NOT NULL,
    "leadId" integer NOT NULL,
    "userId" integer NOT NULL,
    "phoneNumber" text NOT NULL,
    "callType" text NOT NULL,
    status text NOT NULL,
    duration integer,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "recordingUrl" text,
    region text,
    "isRecorded" boolean DEFAULT false NOT NULL,
    "errorMessage" text,
    "errorCode" text,
    provider text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.voip_calls OWNER TO omkardhole;

--
-- Name: voip_calls_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.voip_calls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voip_calls_id_seq OWNER TO omkardhole;

--
-- Name: voip_calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.voip_calls_id_seq OWNED BY public.voip_calls.id;


--
-- Name: voip_configurations; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.voip_configurations (
    id integer NOT NULL,
    provider text NOT NULL,
    "apiKey" text NOT NULL,
    "apiSecret" text NOT NULL,
    "accountSid" text,
    "authToken" text,
    regions text[],
    "defaultRegion" text,
    "enableCallRecording" boolean DEFAULT false NOT NULL,
    "recordingStorage" text DEFAULT 'none'::text,
    "enableVideoCalls" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    metadata jsonb
);


ALTER TABLE public.voip_configurations OWNER TO omkardhole;

--
-- Name: voip_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.voip_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.voip_configurations_id_seq OWNER TO omkardhole;

--
-- Name: voip_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.voip_configurations_id_seq OWNED BY public.voip_configurations.id;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.webhooks (
    id integer NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    events jsonb,
    secret text,
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.webhooks OWNER TO omkardhole;

--
-- Name: webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.webhooks_id_seq OWNER TO omkardhole;

--
-- Name: webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.webhooks_id_seq OWNED BY public.webhooks.id;


--
-- Name: workflow_executions; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.workflow_executions (
    id integer NOT NULL,
    "workflowId" integer NOT NULL,
    "triggerData" jsonb NOT NULL,
    status public."WorkflowExecutionStatus" NOT NULL,
    result jsonb,
    error text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    duration integer
);


ALTER TABLE public.workflow_executions OWNER TO omkardhole;

--
-- Name: workflow_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.workflow_executions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.workflow_executions_id_seq OWNER TO omkardhole;

--
-- Name: workflow_executions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.workflow_executions_id_seq OWNED BY public.workflow_executions.id;


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: omkardhole
--

CREATE TABLE public.workflows (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    trigger public."WorkflowTrigger" NOT NULL,
    "triggerData" jsonb,
    conditions jsonb NOT NULL,
    actions jsonb NOT NULL,
    "createdBy" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.workflows OWNER TO omkardhole;

--
-- Name: workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: omkardhole
--

CREATE SEQUENCE public.workflows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.workflows_id_seq OWNER TO omkardhole;

--
-- Name: workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: omkardhole
--

ALTER SEQUENCE public.workflows_id_seq OWNED BY public.workflows.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: business_settings id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.business_settings ALTER COLUMN id SET DEFAULT nextval('public.business_settings_id_seq'::regclass);


--
-- Name: call_logs id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.call_logs ALTER COLUMN id SET DEFAULT nextval('public.call_logs_id_seq'::regclass);


--
-- Name: communication_automations id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_automations ALTER COLUMN id SET DEFAULT nextval('public.communication_automations_id_seq'::regclass);


--
-- Name: communication_messages id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_messages ALTER COLUMN id SET DEFAULT nextval('public.communication_messages_id_seq'::regclass);


--
-- Name: communication_providers id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_providers ALTER COLUMN id SET DEFAULT nextval('public.communication_providers_id_seq'::regclass);


--
-- Name: communication_templates id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_templates ALTER COLUMN id SET DEFAULT nextval('public.communication_templates_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_activities id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_activities ALTER COLUMN id SET DEFAULT nextval('public.company_activities_id_seq'::regclass);


--
-- Name: company_communications id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_communications ALTER COLUMN id SET DEFAULT nextval('public.company_communications_id_seq'::regclass);


--
-- Name: company_followups id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_followups ALTER COLUMN id SET DEFAULT nextval('public.company_followups_id_seq'::regclass);


--
-- Name: currencies id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.currencies ALTER COLUMN id SET DEFAULT nextval('public.currencies_id_seq'::regclass);


--
-- Name: deal_products id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deal_products ALTER COLUMN id SET DEFAULT nextval('public.deal_products_id_seq'::regclass);


--
-- Name: deal_statuses id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deal_statuses ALTER COLUMN id SET DEFAULT nextval('public.deal_statuses_id_seq'::regclass);


--
-- Name: deals id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals ALTER COLUMN id SET DEFAULT nextval('public.deals_id_seq'::regclass);


--
-- Name: email_audit_logs id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.email_audit_logs_id_seq'::regclass);


--
-- Name: email_branding id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_branding ALTER COLUMN id SET DEFAULT nextval('public.email_branding_id_seq'::regclass);


--
-- Name: email_campaign_executions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaign_executions ALTER COLUMN id SET DEFAULT nextval('public.email_campaign_executions_id_seq'::regclass);


--
-- Name: email_campaigns id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaigns ALTER COLUMN id SET DEFAULT nextval('public.email_campaigns_id_seq'::regclass);


--
-- Name: email_localizations id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_localizations ALTER COLUMN id SET DEFAULT nextval('public.email_localizations_id_seq'::regclass);


--
-- Name: email_template_versions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_template_versions ALTER COLUMN id SET DEFAULT nextval('public.email_template_versions_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: field_configs id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.field_configs ALTER COLUMN id SET DEFAULT nextval('public.field_configs_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: industries id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.industries ALTER COLUMN id SET DEFAULT nextval('public.industries_id_seq'::regclass);


--
-- Name: industry_fields id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.industry_fields ALTER COLUMN id SET DEFAULT nextval('public.industry_fields_id_seq'::regclass);


--
-- Name: integration_logs id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.integration_logs ALTER COLUMN id SET DEFAULT nextval('public.integration_logs_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoice_templates id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_templates ALTER COLUMN id SET DEFAULT nextval('public.invoice_templates_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: lead_assignment_rules id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_assignment_rules ALTER COLUMN id SET DEFAULT nextval('public.lead_assignment_rules_id_seq'::regclass);


--
-- Name: lead_communications id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_communications ALTER COLUMN id SET DEFAULT nextval('public.lead_communications_id_seq'::regclass);


--
-- Name: lead_followups id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_followups ALTER COLUMN id SET DEFAULT nextval('public.lead_followups_id_seq'::regclass);


--
-- Name: lead_import_batches id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_batches ALTER COLUMN id SET DEFAULT nextval('public.lead_import_batches_id_seq'::regclass);


--
-- Name: lead_import_records id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_records ALTER COLUMN id SET DEFAULT nextval('public.lead_import_records_id_seq'::regclass);


--
-- Name: lead_integration_sync id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_integration_sync ALTER COLUMN id SET DEFAULT nextval('public.lead_integration_sync_id_seq'::regclass);


--
-- Name: lead_sources id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_sources ALTER COLUMN id SET DEFAULT nextval('public.lead_sources_id_seq'::regclass);


--
-- Name: lead_tags id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_tags ALTER COLUMN id SET DEFAULT nextval('public.lead_tags_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: login_sessions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.login_sessions ALTER COLUMN id SET DEFAULT nextval('public.login_sessions_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_history id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.password_history ALTER COLUMN id SET DEFAULT nextval('public.password_history_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: proposal_templates id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.proposal_templates ALTER COLUMN id SET DEFAULT nextval('public.proposal_templates_id_seq'::regclass);


--
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- Name: quotation_templates id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_templates ALTER COLUMN id SET DEFAULT nextval('public.quotation_templates_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: super_admin_permissions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_permissions ALTER COLUMN id SET DEFAULT nextval('public.super_admin_permissions_id_seq'::regclass);


--
-- Name: super_admin_role_assignments id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_assignments ALTER COLUMN id SET DEFAULT nextval('public.super_admin_role_assignments_id_seq'::regclass);


--
-- Name: super_admin_role_permissions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_permissions ALTER COLUMN id SET DEFAULT nextval('public.super_admin_role_permissions_id_seq'::regclass);


--
-- Name: super_admin_roles id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_roles ALTER COLUMN id SET DEFAULT nextval('public.super_admin_roles_id_seq'::regclass);


--
-- Name: super_admins id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admins ALTER COLUMN id SET DEFAULT nextval('public.super_admins_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: taxes id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.taxes ALTER COLUMN id SET DEFAULT nextval('public.taxes_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: terms_and_conditions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.terms_and_conditions ALTER COLUMN id SET DEFAULT nextval('public.terms_and_conditions_id_seq'::regclass);


--
-- Name: third_party_integrations id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.third_party_integrations ALTER COLUMN id SET DEFAULT nextval('public.third_party_integrations_id_seq'::regclass);


--
-- Name: unit_types id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.unit_types ALTER COLUMN id SET DEFAULT nextval('public.unit_types_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voip_calls id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_calls ALTER COLUMN id SET DEFAULT nextval('public.voip_calls_id_seq'::regclass);


--
-- Name: voip_configurations id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_configurations ALTER COLUMN id SET DEFAULT nextval('public.voip_configurations_id_seq'::regclass);


--
-- Name: webhooks id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN id SET DEFAULT nextval('public.webhooks_id_seq'::regclass);


--
-- Name: workflow_executions id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.workflow_executions ALTER COLUMN id SET DEFAULT nextval('public.workflow_executions_id_seq'::regclass);


--
-- Name: workflows id; Type: DEFAULT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.workflows ALTER COLUMN id SET DEFAULT nextval('public.workflows_id_seq'::regclass);


--
-- Data for Name: _LeadToProduct; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public."_LeadToProduct" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _TeamProducts; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public."_TeamProducts" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4e7e43ff-5c59-4770-aaed-8ab1d963038c	06fcf0e7b72946c1e93ac8cead83a6996c63c0e9ce92f9fa67ec9a41ed9eabc7	2026-01-17 14:54:37.399941+05:30	20251028180021_init	\N	\N	2026-01-17 14:54:37.305387+05:30	1
8ed3cf5d-f2d2-4a18-857a-d55dad6009ed	7b8f190cfd78f4c891ceab4723237834df72cbfbb17e8f46682ed61dd9fc6c73	2026-01-17 14:54:37.401785+05:30	20251101054853_add_role_access_scope	\N	\N	2026-01-17 14:54:37.400225+05:30	1
36b39375-ad54-40d5-a6c8-2bc680ef8de6	a47a16ab2c261df1cf1b950993269ddec31fc6f8ca1591989cbff3b647a23bd2	2026-01-19 19:13:16.764574+05:30	20260119134316_add_lead_type_customer_type	\N	\N	2026-01-19 19:13:16.746707+05:30	1
dde9d9c3-cf12-4cce-8a85-99169d313e1f	9500552e13cc0d51674275709fc28e556c848aba0cc8441f0d5d17ed4002c7ce	2026-01-17 14:54:37.406368+05:30	20251105061358_remove_contact_module	\N	\N	2026-01-17 14:54:37.402063+05:30	1
badb7961-b344-4b34-a31f-d80402569ce7	54a0dca3214f5a387e1cc69e7ddd9e65f538fa6172ced3846eb9423e608a53cc	2026-01-17 14:54:37.40831+05:30	20251105071011_add_lead_conversion_tracking	\N	\N	2026-01-17 14:54:37.406802+05:30	1
dd77df80-1f58-4a4f-8925-1fca6f6aed9e	9d1929baef4eaf57ac086968bb955b4689b2086477a390e39a1542787037b866	2026-01-17 14:54:37.409733+05:30	20251105125802_add_lead_relation_to_activity	\N	\N	2026-01-17 14:54:37.408546+05:30	1
c8b73fbe-b072-4141-af9e-3d9e4fe25d41	f1b71239a0400751401129f58a8072eed322d2429eac13b91373e951f3418d51	2026-01-17 14:54:37.410664+05:30	20251106120000_add_previous_status_manual	\N	\N	2026-01-17 14:54:37.409935+05:30	1
2503dddb-e565-472d-a6f1-0e22c0240df3	392db476bd955ed1249884dcfe447eeab446c5fd54337cdacd47f6fa28eb8df8	2026-01-17 14:54:37.413101+05:30	20251106130000_add_notes_table_manual	\N	\N	2026-01-17 14:54:37.410914+05:30	1
4316f077-bcd3-40e8-be41-22700e0f71c2	784d7ff9dfce3d73a43a5906ff218bf8a448fefdcc51b1a037edb6b8fc05e866	2026-01-17 14:54:37.419169+05:30	20251107000000_add_expenses_table_manual	\N	\N	2026-01-17 14:54:37.413509+05:30	1
75102fd8-d93b-4ff9-89ec-2a1a51086940	6f2263896281b893cb1a1e8a39d8186feff93d421308d1a45122119466fd96e3	2026-01-17 14:54:37.420158+05:30	20251107180000_add_approved_at_to_expenses	\N	\N	2026-01-17 14:54:37.419424+05:30	1
fa5a2cbd-1d8d-434f-baa1-bdb71adc7499	8e2d5cf77bfe0adb4ac1aad024186a6050d13a72b308dd2013e31aeaaba2cf78	2026-01-17 14:54:37.450146+05:30	20260106062239_renovate_team_products	\N	\N	2026-01-17 14:54:37.420539+05:30	1
b052972b-57cf-4dfb-99f0-1f9497b1df2d	706fdb3a31bbc41c27063b2bc2f14086632be16a3eb081ed1c757858136a07ad	2026-01-17 14:54:37.452402+05:30	20260106065308_add_webhooks	\N	\N	2026-01-17 14:54:37.450428+05:30	1
6e26ced6-23bb-4dba-9de6-1e82c836ba67	f871dd3f3500d3757d56e44ea52b8722034c7905d2629ccb05eacdce8a65770e	2026-01-17 14:54:37.453585+05:30	20260106075658_add_user_language	\N	\N	2026-01-17 14:54:37.452644+05:30	1
790ff50f-7a47-474b-aded-5f0e70dd1842	0d5d73fcecac71d2c90406122e4bbbb5ff4d082ea4fe4e5a26da68294e655aba	2026-01-17 14:54:37.454689+05:30	20260106085559_add_arabic_fields	\N	\N	2026-01-17 14:54:37.453812+05:30	1
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.activities (id, title, description, type, icon, "iconColor", tags, metadata, "createdAt", "updatedAt", "userId", "superAdminId", "leadId") FROM stdin;
1	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-17 09:33:06.143	2026-01-17 09:33:06.143	1	\N	\N
2	New Lead Created	Lead test tes was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-17 09:33:55.021	2026-01-17 09:33:55.021	1	\N	1
3	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-19 09:52:08.1	2026-01-19 09:52:08.1	1	\N	\N
4	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-19 10:03:42.903	2026-01-19 10:03:42.903	1	\N	\N
5	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-19 12:21:50.748	2026-01-19 12:21:50.748	1	\N	\N
6	New Lead Created	Lead test test was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-19 12:23:35.303	2026-01-19 12:23:35.303	1	\N	2
7	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-19 13:19:36.909	2026-01-19 13:19:36.909	1	\N	\N
8	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-19 13:47:46.923	2026-01-19 13:47:46.923	1	\N	\N
9	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-20 07:01:09.415	2026-01-20 07:01:09.415	1	\N	\N
10	New Lead Created	Lead tedt trst was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-20 07:01:58.918	2026-01-20 07:01:58.918	1	\N	3
11	New Lead Created	Lead test test was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-20 07:12:54.708	2026-01-20 07:12:54.708	1	\N	4
12	New Lead Created	Lead omkar dhole was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-20 07:23:26.958	2026-01-20 07:23:26.958	1	\N	5
13	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-20 10:11:02.766	2026-01-20 10:11:02.766	1	\N	\N
14	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-20 11:56:37.552	2026-01-20 11:56:37.552	1	\N	\N
15	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-20 12:24:23.844	2026-01-20 12:24:23.844	1	\N	\N
16	New Lead Created	Lead Omkar Dhole was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-20 13:41:14.722	2026-01-20 13:41:14.722	1	\N	6
17	New Lead Created	Lead Priyanshu Jain was created.	LEAD_CREATED	FiUser	text-blue-600	{}	\N	2026-01-20 15:53:35.378	2026-01-20 15:53:35.378	1	\N	7
18	Status changed	Status: contacted → new	LEAD_STATUS_CHANGED	TrendingUp	#10B981	{}	{"leadId": 7, "changes": ["Status: contacted → new"], "newStatus": "NEW", "oldStatus": "CONTACTED", "newPriority": "MEDIUM", "oldPriority": "MEDIUM", "newAssignedTo": 1, "oldAssignedTo": 1}	2026-01-20 15:53:49.764	2026-01-20 15:53:49.764	1	\N	7
19	Quotation created	Quotation "Q-000001" created with total amount BHD 50.00	QUOTATION_CREATED	FileText	#10B981	{}	{"currency": "BHD", "quotationId": 1, "totalAmount": 50, "quotationNumber": "Q-000001"}	2026-01-21 05:41:28.226	2026-01-21 05:41:28.226	1	\N	7
20	Quotation created	Quotation "Q-000002" created with total amount USD 50.00	QUOTATION_CREATED	FileText	#10B981	{}	{"currency": "USD", "quotationId": 2, "totalAmount": 50, "quotationNumber": "Q-000002"}	2026-01-21 05:42:15.437	2026-01-21 05:42:15.437	1	\N	6
21	User Login	Admin User logged in successfully	USER_LOGIN	LogIn	text-green-500	{}	\N	2026-01-21 09:27:13.049	2026-01-21 09:27:13.049	1	\N	\N
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.budgets (id, name, description, "budgetType", amount, spent, period, "startDate", "endDate", "expenseType", "projectId", "departmentId", currency, "isActive", "alertThreshold", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.business_settings (id, "companyName", "companyEmail", "companyPhone", "companyAddress", "companyWebsite", "companyLogo", "timeZone", "dateFormat", currency, "passwordMinLength", "passwordRequireUpper", "passwordRequireLower", "passwordRequireNumber", "passwordRequireSymbol", "sessionTimeout", "maxLoginAttempts", "accountLockDuration", "twoFactorRequired", "emailVerificationRequired", "createdAt", "updatedAt", "leadAutoAssignmentEnabled", "leadFollowUpReminderDays", "metaAdsApiKey", "metaAdsApiSecret", "metaAdsEnabled", "indiamartApiKey", "indiamartApiSecret", "indiamartEnabled", "tradindiaApiKey", "tradindiaApiSecret", "tradindiaEnabled", "gstNumber", "panNumber", "cinNumber", "fiscalYearStart", industry, "employeeCount", description, "invoiceNumberingEnabled", "invoicePad", "invoicePrefix", "invoiceSuffix", "invoiceTemplate", preferences, "quoteNumberingEnabled", "quotePad", "quotePrefix", "quoteSuffix") FROM stdin;
1	WeConnect	support@evolutionco.com				data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQ2IiBoZWlnaHQ9IjcxIiB2aWV3Qm94PSIwIDAgMjQ2IDcxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMjE5LjA5IDAuOTIxMTQzSDIzMS45MjVMMjMxLjk5MiAxMC43ODk0QzIzMi4wMDMgMTMuNDY3NiAyMzQuNDI1IDE1LjYzNDYgMjM3LjQwNCAxNS42MzQ2SDI0NS44MzhMMjQ1LjkwNSAyNS41OTE3QzI0NS45MTYgMjguMjY5OSAyNDMuNTI3IDMwLjQzNjkgMjQwLjU0OSAzMC40MzY5SDIzNS41MTRDMjMyLjU0NyAzMC40MzY5IDIzMC4xMjUgMjguMjY5OSAyMzAuMTAzIDI1LjU5MTdMMjMwLjA0NyAxNi4yOTAySDIxOS4xOUMyMTYuMjIzIDE2LjI5MDIgMjEzLjggMTQuMTIzMiAyMTMuNzc4IDExLjQ0NUwyMTMuNzIyIDUuNzY2MzVDMjEzLjcyMiAzLjA5OTI2IDIxNi4xMjMgMC45MjExNDMgMjE5LjA5IDAuOTIxMTQzWiIgZmlsbD0iI0VGNDQ0RSIvPgo8cGF0aCBkPSJNMjMyLjAwMyAxMC43ODk0TDIzMS45MzYgMC45MjExNDNIMjQwLjM3MUMyNDMuMzM4IDAuOTIxMTQzIDI0NS43NiAzLjA4ODE1IDI0NS43ODMgNS43NjYzNUwyNDUuODQ5IDE1LjYzNDZIMjM3LjQxNUMyMzQuNDM2IDE1LjYzNDYgMjMyLjAxNCAxMy40Njc2IDIzMi4wMDMgMTAuNzg5NFoiIGZpbGw9IiNBNDNDM0MiLz4KPHBhdGggZD0iTTAgMzAuNjM3SDUuNzg5ODFMOS45MTI2OCA0NC40NzI1SDkuOTkwNDdMMTMuNzAyMiAzMC42MzdIMTguMDI1MUwyMS43MDM0IDQ0LjQ3MjVIMjEuNzgxMkwyNS45NDg2IDMwLjYzN0gzMS43Mzg0TDIzLjQ0ODIgNTMuMjg1SDIwLjEwMzJMMTUuODgwMyAzOC41OTM4SDE1LjgwMjVMMTEuNTEyOSA1My4yODVIOC4xNjc5NkwwIDMwLjYzN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zOS4xODMxIDQ0LjM5NDhDMzkuNDI3NiA0NS44NjE3IDQxLjU1MDEgNDkuMDUxMSA0NS40Mjg1IDQ5LjA1MTFDNDcuODQgNDkuMDUxMSA0OS42MjkyIDQ4LjAyODcgNTAuNjUxNiA0Ni4xNTA2SDU2LjM2MzZDNTUuMDUyMyA1MC4yMjkgNTAuNzczOCA1NC4wMTg1IDQ1LjQxNzQgNTQuMDE4NUMzOC41MTYzIDU0LjAxODUgMzMuNDYgNDguNjI4OCAzMy40NiA0Mi4wMTY2QzMzLjQ2IDM1LjYwNDUgMzguMTk0IDI5Ljg1OTEgNDUuMzczIDI5Ljg1OTFDNTIuNzk2NCAyOS44NTkxIDU3LjA4NTkgMzUuOTM3OSA1Ny4wODU5IDQxLjY0OTlDNTcuMDg1OSA0Mi43MDU2IDU2LjkxOTIgNDMuNjUwMiA1Ni43NjM3IDQ0LjM4MzdIMzkuMTgzMVY0NC4zOTQ4Wk01MS41NDA2IDQwLjAyNzRDNTAuOTI5NCAzNi4zOTM1IDQ4LjMxNzkgMzQuODQ4OCA0NS40MTc0IDM0Ljg0ODhDNDMuMjE3MSAzNC44NDg4IDQwLjAyNzcgMzUuODI2NyAzOS4wMDUzIDQwLjAyNzRINTEuNTQwNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04My4yMTQgNDUuOTA2QzgxLjM4MDQgNTAuOTYyNCA3Ny4xNjg2IDU0LjAyOTUgNzEuODY3OCA1NC4wMjk1QzY2LjA3OCA1NC4wMjk1IDU5LjgzMjUgNDkuMzczMiA1OS44MzI1IDQxLjg3MkM1OS44MzI1IDM0LjkzNzYgNjUuNTg5IDI5Ljg3MDEgNzEuODM0NCAyOS44NzAxQzc0LjY5MDQgMjkuODcwMSA4MC44OTE0IDMxLjE4MTQgODMuMjI1MSAzOC4xNjAzSDc3LjEwMTlDNzYuNDQ2MyAzNy4wMTU3IDc1LjE3OTQgMzQuODU5OCA3MS44MzQ0IDM0Ljg1OThDNjguNTMzOSAzNC44NTk4IDY1LjI2NjcgMzcuMzA0NiA2NS4yNjY3IDQxLjk2MDlDNjUuMjY2NyA0NS44MzkzIDY4LjAwMDUgNDkuMDYyMSA3Mi4wNzg5IDQ5LjA2MjFDNzMuODc5MiA0OS4wNjIxIDc1LjY2ODQgNDguMjA2NCA3Ny4xMDE5IDQ1LjkxNzFMODMuMjE0IDQ1LjkwNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04NS40NTggNDEuOTgzM0M4NS40NTggMzUuMTI2NiA5MS4wNDc4IDI5Ljg1OTEgOTcuNTM3NyAyOS44NTkxQzEwMy45NSAyOS44NTkxIDEwOS41NCAzNC45NTk5IDEwOS41NCA0MS44OTQ0QzEwOS41NCA0OS4zMTc4IDEwMy44MjggNTQuMDE4NSA5Ny41Mzc3IDU0LjAxODVDOTAuODAzMyA1NC4wMTg1IDg1LjQ1OCA0OC40NzMyIDg1LjQ1OCA0MS45ODMzWk0xMDQuMTA1IDQyLjAyNzdDMTA0LjEwNSAzNy45MDQ5IDEwMC45MjcgMzQuODQ4OCA5Ny41Mzc3IDM0Ljg0ODhDOTQuNzI2MiAzNC44NDg4IDkwLjg4MTEgMzcuMjYwMyA5MC44ODExIDQxLjk5NDRDOTAuODgxMSA0Ni4yODQgOTQuMTAzOCA0OS4wNTExIDk3LjUzNzcgNDkuMDUxMUMxMDEuNDk0IDQ5LjA0IDEwNC4xMDUgNDUuNjE3MiAxMDQuMTA1IDQyLjAyNzdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTEyLjc2MiAzMC42MzdIMTE3Ljc4NVYzMi41OTI5QzExOC42ODUgMzEuNzM3MiAxMjAuNTYzIDI5Ljg1OTEgMTIzLjk4NiAyOS44NTkxQzEyNS45NDIgMjkuODU5MSAxMjguOTIgMzAuNzE0OCAxMzAuNzk4IDMzLjAwNDFDMTMyLjg3NyAzNS40OTM0IDEzMi44NzcgMzkuMjk0IDEzMi44NzcgNDEuMDM4N1Y1My4yODUxSDEyNy40NTNWNDIuMTA1NUMxMjcuNDUzIDQwLjIyNzQgMTI3LjQ1MyAzNC44Mzc3IDEyMi44ODYgMzQuODM3N0MxMjEuOTA4IDM0LjgzNzcgMTIwLjE1MiAzNS4zMjY3IDExOS4xNzQgMzYuODM4QzExOC4xOTYgMzguMjI3MSAxMTguMTk2IDQwLjU5NDIgMTE4LjE5NiA0Mi41MDU2VjUzLjI4NTFIMTEyLjc3M0wxMTIuNzYyIDMwLjYzN1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzcuMjQ0IDMwLjYzN0gxNDIuMjY3VjMyLjU5MjlDMTQzLjE2NyAzMS43MzcyIDE0NS4wNDUgMjkuODU5MSAxNDguNDY4IDI5Ljg1OTFDMTUwLjQyNCAyOS44NTkxIDE1My40MDIgMzAuNzE0OCAxNTUuMjggMzMuMDA0MUMxNTcuMzU4IDM1LjQ5MzQgMTU3LjM1OCAzOS4yOTQgMTU3LjM1OCA0MS4wMzg3VjUzLjI4NTFIMTUxLjkzNVY0Mi4xMDU1QzE1MS45MzUgNDAuMjI3NCAxNTEuOTM1IDM0LjgzNzcgMTQ3LjM2OCAzNC44Mzc3QzE0Ni4zOSAzNC44Mzc3IDE0NC42MzQgMzUuMzI2NyAxNDMuNjU2IDM2LjgzOEMxNDIuNjc4IDM4LjIyNzEgMTQyLjY3OCA0MC41OTQyIDE0Mi42NzggNDIuNTA1NlY1My4yODUxSDEzNy4yNTVMMTM3LjI0NCAzMC42MzdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTY2LjUwNCA0NC4zOTQ2QzE2Ni43NDggNDUuODYxNSAxNjguODcxIDQ5LjA1MDkgMTcyLjc0OSA0OS4wNTA5QzE3NS4xNjEgNDkuMDUwOSAxNzYuOTUgNDguMDI4NiAxNzcuOTcyIDQ2LjE1MDVIMTgzLjY4NUMxODIuMzczIDUwLjIyODkgMTc4LjA5NSA1NC4wMjk1IDE3Mi43NDkgNTQuMDI5NUMxNjUuODQ4IDU0LjAyOTUgMTYwLjc5MiA0OC42Mzk4IDE2MC43OTIgNDIuMDI3NkMxNjAuNzkyIDM1LjYxNTUgMTY1LjUyNiAyOS44NzAxIDE3Mi43MDUgMjkuODcwMUMxODAuMTI4IDI5Ljg3MDEgMTg0LjQxOCAzNS45NDg5IDE4NC40MTggNDEuNjYwOUMxODQuNDE4IDQyLjcxNjYgMTg0LjI1MSA0My42NjEyIDE4NC4wOTYgNDQuMzk0NkgxNjYuNTA0Wk0xNzguODczIDQwLjAyNzNDMTc4LjI2MSAzNi4zOTM0IDE3NS42NSAzNC44NDg3IDE3Mi43NDkgMzQuODQ4N0MxNzAuNTQ5IDM0Ljg0ODcgMTY3LjM2IDM1LjgyNjYgMTY2LjMzNyA0MC4wMjczSDE3OC44NzNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjEwLjU0NSA0NS45MDZDMjA4LjcxMSA1MC45NjI0IDIwNC40OTkgNTQuMDI5NSAxOTkuMTk4IDU0LjAyOTVDMTkzLjQwOSA1NC4wMjk1IDE4Ny4xNjMgNDkuMzczMiAxODcuMTYzIDQxLjg3MkMxODcuMTYzIDM0LjkzNzYgMTkyLjkyIDI5Ljg3MDEgMTk5LjE2NSAyOS44NzAxQzIwMi4wMjEgMjkuODcwMSAyMDguMjIyIDMxLjE4MTQgMjEwLjU1NiAzOC4xNjAzSDIwNC40MzJDMjAzLjc3NyAzNy4wMTU3IDIwMi41MSAzNC44NTk4IDE5OS4xNjUgMzQuODU5OEMxOTUuODY0IDM0Ljg1OTggMTkyLjU5NyAzNy4zMDQ2IDE5Mi41OTcgNDEuOTYwOUMxOTIuNTk3IDQ1LjgzOTMgMTk1LjMzMSA0OS4wNjIxIDE5OS40MDkgNDkuMDYyMUMyMDEuMjEgNDkuMDYyMSAyMDIuOTk5IDQ4LjIwNjQgMjA0LjQzMiA0NS45MTcxTDIxMC41NDUgNDUuOTA2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxNS4yNzkgMzUuNDQ4OEgyMTIuNjIzVjMwLjYzNjlIMjE1LjI3OVYyMy4wOTEzSDIyMC43MDJWMzAuNjM2OUgyMjMuOTY5VjM1LjQ0ODhIMjIwLjcwMlY1My4yODVIMjE1LjI3OVYzNS40NDg4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTExMy4yODUgNjcuNzk4NEgxMTEuNjA3VjY2Ljg2NDlIMTExLjU4NUMxMTEuMjQgNjcuNDIwNiAxMTAuNDQgNjguMDU0IDEwOS4xNCA2OC4wNTRDMTA3LjE5NSA2OC4wNTQgMTA1LjIzOSA2Ni40NTM4IDEwNS4yMzkgNjMuOTg2N0MxMDUuMjM5IDYxLjQwODUgMTA3LjMwNiA1OS44OTcyIDEwOS4xNCA1OS44OTcyQzExMC4yNTEgNTkuODk3MiAxMTAuOTE4IDYwLjI2MzkgMTExLjQ1MSA2MC44MzA2VjU3LjYwNzlIMTEzLjI4NVY2Ny43OTg0Wk0xMDkuMzI5IDY2LjM2NDlDMTEwLjcwNyA2Ni4zNjQ5IDExMS41ODUgNjUuMTIwMiAxMTEuNTg1IDYzLjk2NDVDMTExLjU4NSA2Mi43MDg3IDExMC42MTggNjEuNTY0MSAxMDkuMzI5IDYxLjU2NDFDMTA3Ljk2MiA2MS41NjQxIDEwNy4wNzMgNjIuODMxIDEwNy4wNzMgNjMuOTA4OUMxMDcuMDczIDY1LjMzMTQgMTA4LjEyOSA2Ni4zNjQ5IDEwOS4zMjkgNjYuMzY0OVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMTQuNTk2IDU3LjYwNzlIMTE2LjQyOVY1OS4yODZIMTE0LjU5NlY1Ny42MDc5Wk0xMTQuNTk2IDYwLjE1MjhIMTE2LjQyOVY2Ny43OTg0SDExNC41OTZWNjAuMTUyOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMjUuNzY1IDYwLjE1MjhWNjYuMzk4MkMxMjUuNzY1IDcwLjA3NjYgMTIzLjAzMSA3MC45MjEyIDEyMS41ODcgNzAuOTIxMkMxMjAuMDIgNzAuOTIxMiAxMTguMzk3IDcwLjA5ODggMTE3Ljc0MSA2OC4zODc1SDExOS44NDJDMTIwLjU2NCA2OS4yNDMxIDEyMS40NDIgNjkuMjQzMSAxMjEuNzMxIDY5LjI0MzFDMTIyLjc2NSA2OS4yNDMxIDEyMy45NzYgNjguNTIwOCAxMjQuMDc2IDY2Ljg1MzlMMTI0LjA1NCA2Ni44MzE2QzEyMy44MDkgNjcuMTc2MSAxMjMuMDk4IDY4LjA1NDEgMTIxLjU0MiA2OC4wNTQxQzExOS42ODYgNjguMDU0MSAxMTcuNjMgNjYuNDY0OSAxMTcuNjMgNjMuOTA5QzExNy42MyA2MS41MDg2IDExOS41ODYgNTkuODk3MiAxMjEuNTMxIDU5Ljg5NzJDMTIzLjA5OCA1OS44OTcyIDEyMy43NjUgNjAuNzk3NCAxMjMuOTc2IDYxLjA5NzRIMTIzLjk5OFY2MC4xNjM5SDEyNS43NjVWNjAuMTUyOFpNMTIxLjY3NSA2MS41NzUzQzEyMC41NzUgNjEuNTc1MyAxMTkuNDQyIDYyLjQ3NTQgMTE5LjQ0MiA2My45MjAxQzExOS40NDIgNjUuNDc1OSAxMjAuNjA5IDY2LjM3NiAxMjEuNzMxIDY2LjM3NkMxMjIuODMxIDY2LjM3NiAxMjMuOTIgNjUuNDQyNSAxMjMuOTIgNjMuOTA5QzEyMy45MzEgNjIuODA4OCAxMjMuMDQyIDYxLjU3NTMgMTIxLjY3NSA2MS41NzUzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyNi45OTkgNTcuNjA3OUgxMjguODMzVjU5LjI4NkgxMjYuOTk5VjU3LjYwNzlaTTEyNi45OTkgNjAuMTUyOEgxMjguODMzVjY3Ljc5ODRIMTI2Ljk5OVY2MC4xNTI4WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEzMC43NjUgNjEuNzc1MkgxMjkuODY1VjYwLjE1MjhIMTMwLjc2NVY1Ny42MDc5SDEzMi41OTlWNjAuMTUyOEgxMzMuNjk5VjYxLjc3NTJIMTMyLjU5OVY2Ny43OTg0SDEzMC43NjVWNjEuNzc1MloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNDIuMTU3IDY3Ljc5ODRIMTQwLjQ3OVY2Ni44NDI3QzEzOS45MDEgNjcuNTMxNiAxMzguNzY4IDY4LjA0MjggMTM3LjgwMSA2OC4wNDI4QzEzNS44MzQgNjguMDQyOCAxMzQuMDc4IDY2LjQ3NTkgMTM0LjA3OCA2My45MkMxMzQuMDc4IDYxLjU3NTEgMTM1Ljc5IDU5Ljg4NiAxMzcuOTEyIDU5Ljg4NkMxMzkuNDY4IDU5Ljg4NiAxNDAuMzkgNjAuOTk3MyAxNDAuNDQ2IDYxLjEwODRIMTQwLjQ2OFY2MC4xNDE2SDE0Mi4xNDZMMTQyLjE1NyA2Ny43OTg0Wk0xMzguMTkgNjEuNTc1MUMxMzYuNjkgNjEuNTc1MSAxMzUuOTEyIDYyLjg3NTQgMTM1LjkxMiA2NC4wMkMxMzUuOTEyIDY1LjMyMDIgMTM2Ljg3OSA2Ni4zNzU5IDEzOC4xOSA2Ni4zNzU5QzEzOS40NTcgNjYuMzc1OSAxNDAuNDI0IDY1LjM4NjkgMTQwLjQyNCA2My45NjQ0QzE0MC40MjQgNjIuMzc1MyAxMzkuMjc5IDYxLjU3NTEgMTM4LjE5IDYxLjU3NTFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTQzLjU1NyA1Ny42MDc5SDE0NS4zOVY2Ny43OTg0SDE0My41NTdWNTcuNjA3OVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTAuMTI0IDYwLjE1MjhIMTUyLjA4TDE1My40NjkgNjQuODIwMkgxNTMuNDkxTDE1NC43NDcgNjAuMTUyOEgxNTYuMjAzTDE1Ny40NDcgNjQuODIwMkgxNTcuNDdMMTU4Ljg4MSA2MC4xNTI4SDE2MC44MzdMMTU4LjAzNiA2Ny43OTg1SDE1Ni45MDNMMTU1LjQ2OSA2Mi44MzFIMTU1LjQ0N0wxNTQuMDAyIDY3Ljc5ODVIMTUyLjg2OUwxNTAuMTI0IDYwLjE1MjhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYxLjM0OCA2My45ODY4QzE2MS4zNDggNjEuNjc1MyAxNjMuMjM3IDU5Ljg5NzIgMTY1LjQyNyA1OS44OTcyQzE2Ny41OTQgNTkuODk3MiAxNjkuNDgzIDYxLjYxOTcgMTY5LjQ4MyA2My45NjQ1QzE2OS40ODMgNjYuNDc2IDE2Ny41NDkgNjguMDU0MSAxNjUuNDI3IDY4LjA1NDFDMTYzLjE0OCA2OC4wNTQxIDE2MS4zNDggNjYuMTc2IDE2MS4zNDggNjMuOTg2OFpNMTY3LjY0OSA2My45OTc5QzE2Ny42NDkgNjIuNjA4OCAxNjYuNTcxIDYxLjU3NTMgMTY1LjQyNyA2MS41NzUzQzE2NC40NzEgNjEuNTc1MyAxNjMuMTgyIDYyLjM4NjUgMTYzLjE4MiA2My45ODY4QzE2My4xODIgNjUuNDMxNCAxNjQuMjcxIDY2LjM3NiAxNjUuNDI3IDY2LjM3NkMxNjYuNzYgNjYuMzY0OSAxNjcuNjQ5IDY1LjIwOTIgMTY3LjY0OSA2My45OTc5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3MC42OTMgNjAuMTUyOEgxNzIuMzcxVjYwLjgzMDdIMTcyLjM5NEMxNzIuNzM4IDYwLjMzMDYgMTczLjA4MyA1OS44OTcyIDE3NC4wMzggNTkuODk3MkgxNzQuMTk0VjYxLjY3NTNDMTcyLjUyNyA2MS43NDIgMTcyLjUyNyA2My4wNTMzIDE3Mi41MjcgNjMuNTA4OVY2Ny43OTg1SDE3MC42OTNWNjAuMTUyOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNzUuMzQgNTcuNjA3OUgxNzcuMTczVjYzLjc1MzNIMTc3LjE5NkwxNzkuNjQxIDYwLjE1MjhIMTgxLjc1MkwxNzguOTk2IDYzLjg5NzhMMTgyLjEwOCA2Ny43OTg0SDE3OS43OTZMMTc3LjIwNyA2NC4yMDlIMTc3LjE4NVY2Ny43OTg0SDE3NS4zNTFMMTc1LjM0IDU3LjYwNzlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTgyLjg3NCA2MC4xNTI4SDE4NC41NTJWNjEuMDUzSDE4NC41NzVDMTg1LjQ4NiA1OS44OTcyIDE4Ni42OTcgNTkuODk3MiAxODcuMDUzIDU5Ljg5NzJDMTg5LjU2NCA1OS44OTcyIDE5MC44ODcgNjIuMDY0MiAxOTAuODg3IDYzLjk1MzRDMTkwLjg4NyA2Ni4yMDkzIDE4OS4yMiA2OC4wNjUyIDE4Ny4wNTMgNjguMDY1MkMxODUuNzUzIDY4LjA2NTIgMTg1LjE3NSA2Ny41NDI5IDE4NC42OTcgNjcuMDg3MlY3MC4zNTQ0SDE4Mi44NjNMMTgyLjg3NCA2MC4xNTI4Wk0xODYuODMxIDY2LjM2NDlDMTg3LjgwOSA2Ni4zNjQ5IDE4OS4wNjQgNjUuNTQyNiAxODkuMDY0IDYzLjk2NDVDMTg5LjA2NCA2Mi41NTMyIDE4Ny45ODYgNjEuNTY0MSAxODYuODY0IDYxLjU2NDFDMTg1LjcxOSA2MS41NjQxIDE4NC42MDggNjIuNDg2NSAxODQuNjA4IDYzLjk2NDVDMTg0LjU5NyA2NS42NjQ4IDE4NS45NjQgNjYuMzY0OSAxODYuODMxIDY2LjM2NDlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTkyLjA3NSA1Ny42MDc5SDE5My45MDlWNjcuNzk4NEgxOTIuMDc1VjU3LjYwNzlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAzLjA4OCA2Ny43OTg0SDIwMS40MVY2Ni44NDI3QzIwMC44MzIgNjcuNTMxNiAxOTkuNjk5IDY4LjA0MjggMTk4LjczMiA2OC4wNDI4QzE5Ni43NjUgNjguMDQyOCAxOTUuMDA5IDY2LjQ3NTkgMTk1LjAwOSA2My45MkMxOTUuMDA5IDYxLjU3NTEgMTk2LjcyMSA1OS44ODYgMTk4Ljg0MyA1OS44ODZDMjAwLjM5OSA1OS44ODYgMjAxLjMyMSA2MC45OTczIDIwMS4zNzcgNjEuMTA4NEgyMDEuMzk5VjYwLjE0MTZIMjAzLjA3N1Y2Ny43OTg0SDIwMy4wODhaTTE5OS4xMSA2MS41NzUxQzE5Ny42MSA2MS41NzUxIDE5Ni44MzIgNjIuODc1NCAxOTYuODMyIDY0LjAyQzE5Ni44MzIgNjUuMzIwMiAxOTcuNzk5IDY2LjM3NTkgMTk5LjExIDY2LjM3NTlDMjAwLjM3NyA2Ni4zNzU5IDIwMS4zNDQgNjUuMzg2OSAyMDEuMzQ0IDYzLjk2NDRDMjAxLjM0NCA2Mi4zNzUzIDIwMC4xOTkgNjEuNTc1MSAxOTkuMTEgNjEuNTc1MVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMTIuMTQ1IDY1LjMwOTFDMjExLjUyMyA2Ny4wMjA1IDIxMC4xIDY4LjA1NCAyMDguMzExIDY4LjA1NEMyMDYuMzU1IDY4LjA1NCAyMDQuMjQ0IDY2LjQ4NyAyMDQuMjQ0IDYzLjk0MjJDMjA0LjI0NCA2MS41OTc0IDIwNi4xODggNTkuODg2IDIwOC4zIDU5Ljg4NkMyMDkuMjY3IDU5Ljg4NiAyMTEuMzU2IDYwLjMzMDUgMjEyLjE0NSA2Mi42ODY0SDIxMC4wNzhDMjA5Ljg1NiA2Mi4yOTc1IDIwOS40MzMgNjEuNTc1MSAyMDguMyA2MS41NzUxQzIwNy4xODkgNjEuNTc1MSAyMDYuMDc3IDYyLjM5NzUgMjA2LjA3NyA2My45NzU1QzIwNi4wNzcgNjUuMjg2OCAyMDcgNjYuMzc1OSAyMDguMzc4IDY2LjM3NTlDMjA4Ljk4OSA2Ni4zNzU5IDIwOS41ODkgNjYuMDg3IDIxMC4wNzggNjUuMzA5MUgyMTIuMTQ1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxNC45MTIgNjQuNzk3OEMyMTQuOTkgNjUuMjk3OCAyMTUuNzEzIDY2LjM2NDcgMjE3LjAyNCA2Ni4zNjQ3QzIxNy44MzUgNjYuMzY0NyAyMTguNDQ2IDY2LjAyMDIgMjE4Ljc5MSA2NS4zODY3SDIyMC43MjRDMjIwLjI4IDY2Ljc2NDcgMjE4LjgzNSA2OC4wNDI3IDIxNy4wMzUgNjguMDQyN0MyMTQuNzAxIDY4LjA0MjcgMjEzLjAwMSA2Ni4yMjAyIDIxMy4wMDEgNjMuOTg2NUMyMTMuMDAxIDYxLjgxOTUgMjE0LjYwMSA1OS44NzQ4IDIxNy4wMjQgNTkuODc0OEMyMTkuNTM1IDU5Ljg3NDggMjIwLjk4IDYxLjkzMDYgMjIwLjk4IDYzLjg1MzJDMjIwLjk4IDY0LjIwODggMjIwLjkyNCA2NC41MzEgMjIwLjg2OSA2NC43NzU1SDIxNC45MTJWNjQuNzk3OFpNMjE5LjA5MSA2My4zMTk3QzIxOC44OCA2Mi4wOTczIDIxOC4wMDIgNjEuNTYzOSAyMTcuMDI0IDYxLjU2MzlDMjE2LjI3OSA2MS41NjM5IDIxNS4yMDEgNjEuODk3MyAyMTQuODU3IDYzLjMxOTdIMjE5LjA5MVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=	UTC	MM/DD/YYYY	USD	8	t	t	t	f	24	5	30	f	t	2026-01-17 09:33:06.37	2026-01-21 09:34:41.13	f	3	\N	\N	f	\N	\N	f	\N	\N	f								t	6	INV-		template1	\N	t	6	Q-	
\.


--
-- Data for Name: call_logs; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.call_logs (id, "leadId", "userId", "phoneNumber", "callType", "callStatus", duration, "startTime", "endTime", notes, outcome, "recordingUrl", "isAnswered", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_automations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.communication_automations (id, name, "triggerType", "templateId", "isActive", conditions, delay, "companyId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: communication_messages; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.communication_messages (id, "leadId", "userId", "templateId", type, recipient, subject, content, status, "sentAt", "deliveredAt", "readAt", "failedAt", "errorMessage", "externalId", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_providers; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.communication_providers (id, name, type, config, "isActive", "isDefault", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_templates; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.communication_templates (id, name, type, subject, content, variables, "isActive", "isDefault", "companyId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.companies (id, name, "createdAt", "updatedAt", domain, "isActive", slug, "industryId", address, "alternatePhone", "annualRevenue", "assignedTo", city, "companySize", country, currency, "deletedAt", description, email, "employeeCount", "facebookPage", "foundedYear", "lastContactedAt", "leadScore", "linkedinProfile", "nextFollowUpAt", notes, "parentCompanyId", phone, state, status, tags, timezone, "twitterHandle", website, "zipCode", "createdBy") FROM stdin;
\.


--
-- Data for Name: company_activities; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.company_activities (id, "companyId", "userId", type, title, description, duration, outcome, "scheduledAt", "completedAt", "isCompleted", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_communications; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.company_communications (id, "companyId", "userId", type, subject, content, direction, status, "scheduledAt", "sentAt", "deliveredAt", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_followups; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.company_followups (id, "companyId", "userId", type, subject, notes, priority, "scheduledAt", "completedAt", "isCompleted", "reminderSet", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.currencies (id, name, code, symbol, "exchangeRate", "isActive", "isDefault", "createdAt", "updatedAt") FROM stdin;
1	Bahraini Dinar	BHD	BHD	241.100000	t	t	2026-01-19 13:27:03.024	2026-01-19 13:27:03.024
\.


--
-- Data for Name: deal_products; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.deal_products (id, "dealId", name, quantity, price) FROM stdin;
\.


--
-- Data for Name: deal_statuses; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.deal_statuses (id, name, color, "sortOrder", "isActive", description, "createdAt", "updatedAt") FROM stdin;
1	DRAFT	#c05d85	0	t	\N	2026-01-17 09:33:06.417	2026-01-17 09:33:06.417
2	PROPOSAL	#7b8ef4	1	t	\N	2026-01-17 09:33:06.421	2026-01-17 09:33:06.421
3	NEGOTIATION	#d6e6a0	2	t	\N	2026-01-17 09:33:06.423	2026-01-17 09:33:06.423
4	WON	#32deff	3	t	\N	2026-01-17 09:33:06.425	2026-01-17 09:33:06.425
5	LOST	#2085fd	4	t	\N	2026-01-17 09:33:06.431	2026-01-17 09:33:06.431
6	CLOSED	#9127fc	5	t	\N	2026-01-17 09:33:06.433	2026-01-17 09:33:06.433
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.deals (id, title, description, value, currency, probability, "expectedCloseDate", "actualCloseDate", "assignedTo", "leadId", "companyId", "isActive", "createdAt", "updatedAt", "deletedAt", "createdBy", status) FROM stdin;
\.


--
-- Data for Name: email_audit_logs; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_audit_logs (id, "emailTemplateId", "userId", "leadId", action, status, recipient, subject, content, "errorMessage", metadata, "ipAddress", "userAgent", "sentAt", "deliveredAt", "openedAt", "clickedAt", "bouncedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: email_branding; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_branding (id, "emailTemplateId", "logoUrl", "primaryColor", "secondaryColor", "backgroundColor", "textColor", "fontFamily", signature, "footerText", "socialLinks", "contactInfo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_campaign_executions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_campaign_executions (id, "campaignId", "userId", "leadId", "triggerData", status, "currentStep", "totalSteps", result, error, "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_campaigns (id, name, description, type, "emailTemplateId", "triggerType", "triggerData", steps, "isActive", "isDefault", "companyId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: email_localizations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_localizations (id, "emailTemplateId", locale, language, country, subject, "htmlContent", "textContent", variables, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_template_versions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_template_versions (id, "emailTemplateId", "versionNumber", subject, "htmlContent", "textContent", variables, "changeLog", status, "isActive", "createdBy", "createdAt", "approvedAt", "approvedBy") FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.email_templates (id, name, category, type, subject, "htmlContent", "textContent", variables, metadata, status, "isActive", "isDefault", "companyId", "createdBy", "createdAt", "updatedAt", "approvedAt", "approvedBy", "deletedAt") FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.expenses (id, "expenseDate", amount, type, category, description, remarks, "receiptUrl", status, "submittedBy", "approvedBy", "rejectedBy", "approvalRemarks", "projectId", "dealId", "leadId", currency, "isActive", "createdAt", "updatedAt", "deletedAt", "approvedAt") FROM stdin;
\.


--
-- Data for Name: field_configs; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.field_configs (id, "entityType", "fieldName", label, "isRequired", "isVisible", "displayOrder", section, placeholder, "helpText", validation, options, "createdAt", "updatedAt") FROM stdin;
1	lead	firstName	First Name	t	t	1	personal	\N	\N	{"type": "text", "maxLength": 50, "minLength": 2}	\N	2026-01-17 09:33:14.029	2026-01-17 09:33:14.029
3	lead	lastName	Last Name	t	t	3	personal	\N	\N	{"type": "text", "maxLength": 50, "minLength": 2}	\N	2026-01-17 09:33:14.041	2026-01-17 09:33:14.041
5	lead	email	Email	t	t	5	personal	\N	\N	{"type": "email"}	\N	2026-01-17 09:33:14.043	2026-01-17 09:33:14.043
6	lead	phone	Phone	t	t	6	personal	\N	\N	{"type": "phone"}	\N	2026-01-17 09:33:14.044	2026-01-17 09:33:14.044
7	lead	company	Company	t	t	7	company	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.045	2026-01-17 09:33:14.045
10	lead	industry	Industry	f	t	10	company	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.047	2026-01-17 09:33:14.047
11	lead	website	Company Website	f	t	11	company	\N	\N	{"type": "url"}	\N	2026-01-17 09:33:14.048	2026-01-17 09:33:14.048
13	lead	annualRevenue	Annual Revenue	f	t	13	company	\N	\N	{"min": 0, "type": "number"}	\N	2026-01-17 09:33:14.049	2026-01-17 09:33:14.049
14	lead	country	Country	f	t	14	location	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.049	2026-01-17 09:33:14.049
15	lead	state	State/Province	f	t	15	location	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.05	2026-01-17 09:33:14.05
16	lead	city	City	f	t	16	location	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.05	2026-01-17 09:33:14.05
17	lead	zipCode	ZIP/Postal Code	f	t	17	location	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.051	2026-01-17 09:33:14.051
18	lead	address	Address	f	t	18	location	\N	\N	{"type": "textarea"}	\N	2026-01-17 09:33:14.051	2026-01-17 09:33:14.051
22	lead	sourceId	Lead Source	f	t	22	lead_management	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.053	2026-01-17 09:33:14.053
23	lead	status	Status	t	t	23	lead_management	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.054	2026-01-17 09:33:14.054
25	lead	assignedTo	Assigned To	f	t	25	lead_management	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.055	2026-01-17 09:33:14.055
28	lead	leadScore	Lead Score	f	t	28	lead_management	\N	\N	{"max": 100, "min": 0, "type": "number"}	\N	2026-01-17 09:33:14.056	2026-01-17 09:33:14.056
29	lead	preferredContactMethod	Preferred Contact Method	f	t	29	lead_management	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.057	2026-01-17 09:33:14.057
30	lead	nextFollowUpAt	Next Follow-up Date	f	t	30	lead_management	\N	\N	{"type": "datetime"}	\N	2026-01-17 09:33:14.057	2026-01-17 09:33:14.057
31	lead	notes	Notes	f	t	31	notes	\N	\N	{"type": "textarea"}	\N	2026-01-17 09:33:14.058	2026-01-17 09:33:14.058
12	lead	companySize	Company Size	f	f	12	company	\N	\N	{"min": 0, "type": "number"}	\N	2026-01-17 09:33:14.048	2026-01-19 13:22:14.784
19	lead	addressAr	Address (Arabic)	f	f	19	location	\N	\N	{"type": "textarea"}	\N	2026-01-17 09:33:14.052	2026-01-19 13:23:43.142
21	lead	linkedinProfile	LinkedIn Profile	f	f	21	location	\N	\N	{"type": "url"}	\N	2026-01-17 09:33:14.053	2026-01-19 13:24:03.313
20	lead	timezone	Timezone	f	f	20	location	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.052	2026-01-19 13:24:04.768
33	lead	leadType	Lead Type	t	t	20	lead	\N	\N	\N	\N	2026-01-19 13:44:11.765	2026-01-19 13:44:11.765
34	lead	customerType	Customer Type	t	t	20	lead	\N	\N	\N	\N	2026-01-19 13:44:11.768	2026-01-19 13:44:11.768
32	lead	tags	Tags	f	f	32	notes	\N	\N	{"type": "multiselect"}	\N	2026-01-17 09:33:14.058	2026-01-20 06:03:49.862
41	lead	primaryServiceCategory	Primary Service Category	t	t	3	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.862	2026-01-20 08:53:46.862
42	lead	wasteCategory	Waste Category	f	t	4	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.867	2026-01-20 08:53:46.867
43	lead	servicePreference	Service Preference	t	t	5	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.868	2026-01-20 08:53:46.868
44	lead	serviceFrequency	Service Frequency	t	t	6	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.869	2026-01-20 08:53:46.869
45	lead	expectedStartDate	Expected Start Date	f	t	7	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.87	2026-01-20 08:53:46.87
46	lead	urgencyLevel	Urgency Level	t	t	8	service_interest	\N	\N	\N	\N	2026-01-20 08:53:46.87	2026-01-20 08:53:46.87
47	lead	billingPreference	Billing Preference	f	t	20	commercial_expectation	\N	\N	\N	\N	2026-01-20 08:53:46.873	2026-01-20 08:53:46.873
48	lead	estimatedJobDuration	Estimated Job Duration (Hours)	f	t	21	commercial_expectation	\N	\N	\N	\N	2026-01-20 08:53:46.874	2026-01-20 08:53:46.874
24	lead	priority	Priority	f	f	24	lead_management	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.054	2026-01-20 11:01:58.415
9	lead	position	Position/Job Title	f	t	14	personal	\N	\N	{"type": "text"}	\N	2026-01-17 09:33:14.047	2026-01-20 12:00:05.36
26	lead	budget	Expected Budget	f	t	22	commercial_expectation	\N	\N	{"min": 0, "type": "number"}	\N	2026-01-17 09:33:14.055	2026-01-20 12:02:10.917
27	lead	currency	Currency	f	t	23	commercial_expectation	\N	\N	{"type": "select"}	\N	2026-01-17 09:33:14.056	2026-01-20 12:02:10.919
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.files (id, name, "fileName", "filePath", "fileSize", "mimeType", "entityType", "entityId", "uploadedBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.industries (id, name, slug, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: industry_fields; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.industry_fields (id, "industryId", name, key, type, "isRequired", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: integration_logs; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.integration_logs (id, "integrationId", operation, status, message, data, "errorDetails", "recordsCount", "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.invoice_items (id, "invoiceId", "productId", name, description, quantity, unit, "unitPrice", "taxRate", "discountRate", subtotal, "totalAmount", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_templates; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.invoice_templates (id, name, description, "designType", "headerContent", "footerContent", "termsAndConditions", "showTax", "showDiscount", "logoPosition", "primaryColor", "secondaryColor", "isDefault", "isActive", styles, "createdAt", "updatedAt", "deletedAt") FROM stdin;
253	Professional Invoice	Clean modern layout with logo left, invoice details right.	professional			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#EA580C	#FFF7ED	t	t	\N	2026-01-21 09:26:45.153	2026-01-21 09:26:45.153	\N
254	Blue Theme	Professional Job Card layout in Blue.	job_card			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#2563EB	#DBEAFE	f	t	\N	2026-01-21 09:26:45.157	2026-01-21 09:26:45.157	\N
255	Red Theme	Professional Job Card layout in Red.	job_card			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#DC2626	#FEE2E2	f	t	\N	2026-01-21 09:26:45.157	2026-01-21 09:26:45.157	\N
256	Green Theme	Professional Job Card layout in Green.	job_card			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#16A34A	#DCFCE7	f	t	\N	2026-01-21 09:26:45.158	2026-01-21 09:26:45.158	\N
257	Orange Theme	Professional Job Card layout in Orange.	job_card			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#EA580C	#FFEDD5	f	t	\N	2026-01-21 09:26:45.158	2026-01-21 09:26:45.158	\N
258	Purple Theme	Professional Job Card layout in Purple.	job_card			Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.	t	t	left	#9333EA	#F3E8FF	f	t	\N	2026-01-21 09:26:45.159	2026-01-21 09:26:45.159	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.invoices (id, "invoiceNumber", title, description, status, subtotal, "taxAmount", "discountAmount", "totalAmount", "paidAmount", currency, "dueDate", notes, terms, "companyId", "leadId", "dealId", "quotationId", "createdBy", "sentAt", "viewedAt", "paidAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: lead_assignment_rules; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_assignment_rules (id, name, description, "isActive", conditions, actions, priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_communications; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_communications (id, "leadId", "userId", type, subject, content, direction, duration, outcome, "scheduledAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_followups; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_followups (id, "leadId", "userId", type, subject, notes, "scheduledAt", "completedAt", "isCompleted", "reminderSet", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_import_batches; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_import_batches (id, "fileName", "totalRows", "successRows", "failedRows", status, "errorDetails", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_import_records; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_import_records (id, "batchId", "rowIndex", "leadId", status, errors, "rawData", "createdAt") FROM stdin;
\.


--
-- Data for Name: lead_integration_sync; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_integration_sync (id, "leadId", "integrationId", "externalId", "externalData", "syncStatus", "lastSyncAt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_sources; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_sources (id, name, description, "isActive", "createdAt", "updatedAt", "companyId", color, "sortOrder") FROM stdin;
\.


--
-- Data for Name: lead_tags; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.lead_tags (id, "leadId", "tagId") FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.leads (id, "firstName", "lastName", email, phone, company, "position", status, notes, "isActive", "createdAt", "updatedAt", "sourceId", "assignedTo", "companyId", "deletedAt", budget, currency, "lastContactedAt", "nextFollowUpAt", priority, industry, website, "companySize", "annualRevenue", "leadScore", address, country, state, city, "zipCode", "linkedinProfile", timezone, "preferredContactMethod", "convertedToDealId", "previousStatus", "createdBy", "customFields", "addressAr", "companyAr", "firstNameAr", "lastNameAr", "customerType", "leadType") FROM stdin;
1	test	tes	test@gmail.com	+1 9876543210	test	\N	NEW	\N	t	2026-01-17 09:33:55.006	2026-01-17 09:33:55.006	\N	1	\N	\N	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	email	\N	\N	1	{"lastNameAr": "test", "productIds": [], "firstNameAr": "test"}	\N	\N	\N	\N	FIXED_CUSTOMER	SALES_LEAD
2	test	test	omkar.dhole@evolutionco.com	+1 9876543210	test	\N	NEW	\N	t	2026-01-19 12:23:35.285	2026-01-19 12:23:40.708	\N	1	\N	2026-01-19 12:23:40.707	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	email	\N	\N	1	{"productIds": []}	\N	\N	\N	\N	FIXED_CUSTOMER	SALES_LEAD
4	test	test	test@gmail.com	+1 9876543210	rest	test	NEW	\N	t	2026-01-20 07:12:54.682	2026-01-20 09:52:42.028	\N	1	\N	2026-01-20 09:52:42.026	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	email	\N	\N	1	{"productIds": [], "urgencyLevel": "Medium", "wasteCategory": "", "serviceFrequency": "One-time", "billingPreference": "Per Hour", "expectedStartDate": "2026-01-20", "servicePreference": ["Jetting Service", "Skip Services"], "estimatedJobDuration": 1, "primaryServiceCategory": "Deep Cleaning"}	\N	\N	\N	\N	FIXED_CUSTOMER	SALES_LEAD
3	tedt	trst	test@gmail.com	+1 9876543210	test	\N	NEW	\N	t	2026-01-20 07:01:58.905	2026-01-20 09:52:44.893	\N	1	\N	2026-01-20 09:52:44.891	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	email	\N	\N	1	{"productIds": [], "urgencyLevel": "High", "wasteCategory": "", "serviceFrequency": "Daily", "billingPreference": "Per Load", "expectedStartDate": "2026-01-21", "servicePreference": ["Skip Services", "Tanker Service"], "estimatedJobDuration": 1, "primaryServiceCategory": "High Pressure Jetting"}	\N	\N	\N	\N	WALK_IN_CUSTOMER	SERVICE_LEAD
5	omkar	dhole	omkar.dhole@gmail.com	+1 9876543210	test	\N	NEW	\N	t	2026-01-20 07:23:26.926	2026-01-20 09:52:49.591	\N	1	\N	2026-01-20 09:52:49.59	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	email	\N	\N	1	{"productIds": [], "urgencyLevel": "Medium", "wasteCategory": "", "serviceFrequency": "One-time", "billingPreference": "Per Load", "expectedStartDate": "2026-01-20", "servicePreference": ["Tanker Service"], "estimatedJobDuration": 0, "primaryServiceCategory": "High Pressure Jetting"}	\N	\N	\N	\N	WALK_IN_CUSTOMER	SERVICE_LEAD
6	Omkar	Dhole	test@gmail.com	+973 9876543210	test1	\N	NEW	\N	t	2026-01-20 13:41:14.704	2026-01-20 13:41:14.704	\N	1	\N	\N	\N	USD	\N	\N	MEDIUM	\N	\N	\N	\N	\N	B-8/21	Bahrain	\N	\N	400706	\N	\N	email	\N	\N	1	{"productIds": [], "urgencyLevel": "Medium", "wasteCategory": "", "serviceFrequency": "Alternate Days", "billingPreference": "", "expectedStartDate": "", "servicePreference": ["Road Sweeper"], "primaryServiceCategory": "High Pressure Jetting"}	\N	\N	\N	\N	ON_CALL_CUSTOMER	SERVICE_LEAD
7	Priyanshu	Jain	priyanshu.jain@evolutionco.com	+973 9876543210	EvolutionCo	Bussiness Analytics	NEW	\N	t	2026-01-20 15:53:35.356	2026-01-20 15:53:49.757	\N	1	\N	\N	20000.00	BHD	\N	\N	MEDIUM	\N	https://www.econnecz.in/	\N	498.00	\N	AJ House 7th Floor	Bahrain	Capital Governorate	Manama	400706	\N	\N	email	\N	\N	1	{"productIds": [], "urgencyLevel": "High", "wasteCategory": "", "serviceFrequency": "One-time", "billingPreference": "Per Load", "expectedStartDate": "2026-01-22", "servicePreference": ["Skip Services", "Jetting Service", "Road Sweeper"], "estimatedJobDuration": 2, "primaryServiceCategory": "High Pressure Jetting"}	\N	\N	\N	\N	FIXED_CUSTOMER	SALES_LEAD
\.


--
-- Data for Name: login_sessions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.login_sessions (id, "userId", token, "deviceInfo", "ipAddress", "userAgent", "isActive", "expiresAt", "createdAt", "lastUsedAt") FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.notes (id, title, content, "isPinned", "leadId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.notification_preferences (id, "userId", "inAppEnabled", "emailEnabled", "soundEnabled", preferences, "doNotDisturbStart", "doNotDisturbEnd", "createdAt", "updatedAt") FROM stdin;
2	1	t	f	t	{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}	\N	\N	2026-01-17 09:33:06.298	2026-01-17 09:33:06.298
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.notifications (id, "userId", type, title, message, link, read, "readAt", metadata, "createdAt", "updatedAt") FROM stdin;
1	1	LEAD_STATUS_CHANGED	Lead Status Changed	Lead "Priyanshu Jain" status changed to new	/leads/7	f	\N	{"leadId": 7, "leadName": "Priyanshu Jain"}	2026-01-20 15:53:49.8	2026-01-20 15:53:49.8
2	1	QUOTATION_SENT	Quotation Created	Quotation "Q-000001" has been created for lead "Priyanshu Jain".	/leads/7	f	\N	{"leadId": 7, "quotationId": 1, "quotationNumber": "Q-000001"}	2026-01-21 05:41:28.233	2026-01-21 05:41:28.233
3	1	QUOTATION_SENT	Quotation Created	Quotation "Q-000002" has been created for lead "Omkar Dhole".	/leads/6	f	\N	{"leadId": 6, "quotationId": 2, "quotationNumber": "Q-000002"}	2026-01-21 05:42:15.444	2026-01-21 05:42:15.444
\.


--
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.password_history (id, "userId", password, "createdAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.payments (id, "invoiceId", amount, currency, "paymentMethod", "paymentDate", "referenceNumber", notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.permissions (id, name, key, description, module, "createdAt", "updatedAt") FROM stdin;
1	View Dashboard	dashboard.read	View dashboard	Dashboard	2026-01-17 09:25:09.28	2026-01-17 09:25:09.28
2	View Users	user.read	View users	Users	2026-01-17 09:25:09.285	2026-01-17 09:25:09.285
3	Create Users	user.create	Create users	Users	2026-01-17 09:25:09.286	2026-01-17 09:25:09.286
4	Update Users	user.update	Update users	Users	2026-01-17 09:25:09.286	2026-01-17 09:25:09.286
5	Delete Users	user.delete	Delete users	Users	2026-01-17 09:25:09.287	2026-01-17 09:25:09.287
6	View Roles	role.read	View roles	Roles	2026-01-17 09:25:09.288	2026-01-17 09:25:09.288
7	Create Roles	role.create	Create roles	Roles	2026-01-17 09:25:09.289	2026-01-17 09:25:09.289
8	Update Roles	role.update	Update roles	Roles	2026-01-17 09:25:09.289	2026-01-17 09:25:09.289
9	Delete Roles	role.delete	Delete roles	Roles	2026-01-17 09:25:09.29	2026-01-17 09:25:09.29
10	View Permissions	permission.read	View permissions	Permissions	2026-01-17 09:25:09.291	2026-01-17 09:25:09.291
11	Create Permissions	permission.create	Create permissions	Permissions	2026-01-17 09:25:09.292	2026-01-17 09:25:09.292
12	Update Permissions	permission.update	Update permissions	Permissions	2026-01-17 09:25:09.292	2026-01-17 09:25:09.292
13	Delete Permissions	permission.delete	Delete permissions	Permissions	2026-01-17 09:25:09.293	2026-01-17 09:25:09.293
14	View Leads	lead.read	View leads	Leads	2026-01-17 09:25:09.294	2026-01-17 09:25:09.294
15	Create Leads	lead.create	Create leads	Leads	2026-01-17 09:25:09.295	2026-01-17 09:25:09.295
16	Update Leads	lead.update	Update leads	Leads	2026-01-17 09:25:09.295	2026-01-17 09:25:09.295
17	Delete Leads	lead.delete	Delete leads	Leads	2026-01-17 09:25:09.296	2026-01-17 09:25:09.296
18	View Deals	deal.read	View deals	Deals	2026-01-17 09:25:09.297	2026-01-17 09:25:09.297
19	Create Deals	deal.create	Create deals	Deals	2026-01-17 09:25:09.297	2026-01-17 09:25:09.297
20	Update Deals	deal.update	Update deals	Deals	2026-01-17 09:25:09.298	2026-01-17 09:25:09.298
21	Delete Deals	deal.delete	Delete deals	Deals	2026-01-17 09:25:09.299	2026-01-17 09:25:09.299
22	View Quotations	quotation.read	View quotations	Quotations	2026-01-17 09:25:09.299	2026-01-17 09:25:09.299
23	Create Quotations	quotation.create	Create quotations	Quotations	2026-01-17 09:25:09.3	2026-01-17 09:25:09.3
24	Update Quotations	quotation.update	Update quotations	Quotations	2026-01-17 09:25:09.301	2026-01-17 09:25:09.301
25	Delete Quotations	quotation.delete	Delete quotations	Quotations	2026-01-17 09:25:09.301	2026-01-17 09:25:09.301
26	View Invoices	invoice.read	View invoices	Invoices	2026-01-17 09:25:09.302	2026-01-17 09:25:09.302
27	Create Invoices	invoice.create	Create invoices	Invoices	2026-01-17 09:25:09.302	2026-01-17 09:25:09.302
28	Update Invoices	invoice.update	Update invoices	Invoices	2026-01-17 09:25:09.303	2026-01-17 09:25:09.303
29	Delete Invoices	invoice.delete	Delete invoices	Invoices	2026-01-17 09:25:09.304	2026-01-17 09:25:09.304
30	View Activities	activity.read	View tasks and activities	Activities	2026-01-17 09:25:09.304	2026-01-17 09:25:09.304
31	View Business Settings	business_settings.read	View business settings	BusinessSettings	2026-01-17 09:25:09.305	2026-01-17 09:25:09.305
32	Update Business Settings	business_settings.update	Update business settings	BusinessSettings	2026-01-17 09:25:09.306	2026-01-17 09:25:09.306
33	View Trash	deleted.read	View deleted items	Trash	2026-01-17 09:25:09.307	2026-01-17 09:25:09.307
34	Expense create	expense.create	Create expenses	Expenses	2026-01-17 09:25:09.307	2026-01-17 09:25:09.307
35	Expense read	expense.read	View expenses	Expenses	2026-01-17 09:25:09.308	2026-01-17 09:25:09.308
36	Expense update	expense.update	Edit expenses	Expenses	2026-01-17 09:25:09.308	2026-01-17 09:25:09.308
37	Expense delete	expense.delete	Delete expenses	Expenses	2026-01-17 09:25:09.309	2026-01-17 09:25:09.309
38	Expense approve	expense.approve	Approve/Reject expenses	Expenses	2026-01-17 09:25:09.309	2026-01-17 09:25:09.309
39	View Automations	automation.read	View automations	Automation	2026-01-17 09:25:09.31	2026-01-17 09:25:09.31
40	Create Automations	automation.create	Create automations	Automation	2026-01-17 09:25:09.31	2026-01-17 09:25:09.31
41	Update Automations	automation.update	Update automations	Automation	2026-01-17 09:25:09.311	2026-01-17 09:25:09.311
42	Delete Automations	automation.delete	Delete automations	Automation	2026-01-17 09:25:09.312	2026-01-17 09:25:09.312
43	View User Stats Widget	dashboard.stats_users	View user statistics widget	Dashboard	2026-01-17 09:25:09.312	2026-01-17 09:25:09.312
44	View Role Stats Widget	dashboard.stats_roles	View role statistics widget	Dashboard	2026-01-17 09:25:09.313	2026-01-17 09:25:09.313
45	View Lead Stats Widget	dashboard.stats_leads	View lead statistics widget	Dashboard	2026-01-17 09:25:09.313	2026-01-17 09:25:09.313
46	View System Status Widget	dashboard.system_status	View system status widget	Dashboard	2026-01-17 09:25:09.314	2026-01-17 09:25:09.314
47	View System Activity Widget	dashboard.system_activity	View system activity widget	Dashboard	2026-01-17 09:25:09.314	2026-01-17 09:25:09.314
48	View Activity Calendar Widget	dashboard.activity_calendar	View activity calendar widget	Dashboard	2026-01-17 09:25:09.314	2026-01-17 09:25:09.314
49	View Performance Widget	dashboard.performance	View performance widget	Dashboard	2026-01-17 09:25:09.315	2026-01-17 09:25:09.315
50	View Revenue Metrics Widget	dashboard.revenue_metrics	View revenue metrics widget	Dashboard	2026-01-17 09:25:09.315	2026-01-17 09:25:09.315
51	View Activity Engagement Widget	dashboard.activity_engagement	View activity & engagement widget	Dashboard	2026-01-17 09:25:09.316	2026-01-17 09:25:09.316
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.product_categories (id, name, description, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Electronics	Electronic devices and accessories	t	2026-01-17 09:25:09.449	2026-01-17 09:25:09.449	\N
2	Clothing	Apparel and fashion items	t	2026-01-17 09:25:09.452	2026-01-17 09:25:09.452	\N
3	Books	Books and publications	t	2026-01-17 09:25:09.453	2026-01-17 09:25:09.453	\N
4	Home & Garden	Home improvement and garden supplies	t	2026-01-17 09:25:09.454	2026-01-17 09:25:09.454	\N
5	Sports & Outdoors	Sports equipment and outdoor gear	t	2026-01-17 09:25:09.455	2026-01-17 09:25:09.455	\N
6	Beauty & Personal Care	Cosmetics and personal care products	t	2026-01-17 09:25:09.455	2026-01-17 09:25:09.455	\N
7	Automotive	Car parts and automotive accessories	t	2026-01-17 09:25:09.456	2026-01-17 09:25:09.456	\N
8	Toys & Games	Toys, games and entertainment items	t	2026-01-17 09:25:09.457	2026-01-17 09:25:09.457	\N
9	Food & Beverage	Food items and beverages	t	2026-01-17 09:25:09.457	2026-01-17 09:25:09.457	\N
10	Health & Wellness	Health products and wellness items	t	2026-01-17 09:25:09.458	2026-01-17 09:25:09.458	\N
11	Other	Miscellaneous products	t	2026-01-17 09:25:09.459	2026-01-17 09:25:09.459	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.products (id, name, description, sku, type, category, price, cost, currency, unit, "taxRate", "isActive", "stockQuantity", "minStockLevel", "maxStockLevel", image, "companyId", "createdAt", "updatedAt", "deletedAt", "hsnCode") FROM stdin;
1	abc	test	50	SERVICE	Automotive	50.00	\N	USD	gram	\N	t	0	0	0	\N	\N	2026-01-19 13:30:38.956	2026-01-21 05:35:39.359	\N	\N
\.


--
-- Data for Name: proposal_templates; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.proposal_templates (id, name, description, content, "isActive", "isDefault", "headerHtml", "footerHtml", styles, variables, "previewImage", category, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.quotation_items (id, "quotationId", "productId", name, description, quantity, unit, "unitPrice", "taxRate", "discountRate", subtotal, "totalAmount", "sortOrder", "createdAt", "updatedAt") FROM stdin;
1	1	1	abc	test	1.00	gram	50.00	0.00	0.00	50.00	50.00	0	2026-01-21 05:41:28.211	2026-01-21 05:41:28.211
2	2	1	abc	test	1.00	gram	50.00	0.00	0.00	50.00	50.00	0	2026-01-21 05:42:15.429	2026-01-21 05:42:15.429
\.


--
-- Data for Name: quotation_templates; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.quotation_templates (id, name, description, "headerContent", "footerContent", "termsAndConditions", "validityDays", "showTax", "showDiscount", "logoPosition", "isDefault", "isActive", styles, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.quotations (id, "quotationNumber", title, description, status, subtotal, "taxAmount", "discountAmount", "totalAmount", currency, "validUntil", notes, terms, "companyId", "leadId", "dealId", "createdBy", "sentAt", "viewedAt", "acceptedAt", "rejectedAt", "expiresAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Q-000001	Quotation for Priyanshu Jain	\N	SENT	50.00	0.00	0.00	50.00	BHD	\N	\N		\N	7	\N	1	\N	\N	\N	\N	\N	2026-01-21 05:41:28.211	2026-01-21 05:41:28.211	\N
2	Q-000002	Quotation for Omkar Dhole	\N	SENT	50.00	0.00	0.00	50.00	USD	\N	\N		\N	6	\N	1	\N	\N	\N	\N	\N	2026-01-21 05:42:15.429	2026-01-21 05:42:15.429	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "isRevoked", "createdAt") FROM stdin;
1	$2a$10$uyJnwiOjz1xpydpaviVPP.8XgAPiIyqFpQThtMiJ5bhNjYoJjeHYu	1	2026-01-24 09:33:06.134	f	2026-01-17 09:33:06.134
2	$2a$10$jVUmV52QcabaWrgPU12t8OKLff9rbVssryET.4W./CMv8RPtluorO	1	2026-01-26 09:52:08.092	f	2026-01-19 09:52:08.093
3	$2a$10$RNFeO5.UrvbaEpNyG4u6JOAUKFKCUAtauDCeWqjlHJbvs3SCZrZEq	1	2026-01-26 10:03:42.896	f	2026-01-19 10:03:42.896
4	$2a$10$quEtH0mYuzYRF5.21jpK/etUVVMWnIr9DQNWvve7kGn0.bsmhNBcG	1	2026-01-26 12:21:50.739	f	2026-01-19 12:21:50.74
5	$2a$10$3hoPbVCtkTLao0irZdRz/uf6dE39KlN.X9K/mQsyH/NMyYTOTfhkq	1	2026-01-26 13:19:36.898	f	2026-01-19 13:19:36.899
6	$2a$10$eZpZu/wFvhJn7.q77q07XuO4t1/RNuxqMvP7JGWGjyphmp3cTIOJG	1	2026-01-26 13:47:46.917	f	2026-01-19 13:47:46.917
7	$2a$10$RGz27gNGMNhvI0dzQfB8ruV4MNUPxt/iZ7CueBIRaHth73a0LqOBu	1	2026-01-27 07:01:09.316	f	2026-01-20 07:01:09.317
8	$2a$10$TRMGbElEPN3d5bcgQILulefYDMwVX4/oJaOoHFn3pqoIzkixrqq6y	1	2026-01-27 10:11:02.753	f	2026-01-20 10:11:02.754
9	$2a$10$HqwYd3gk71G4H27bRHVWOOQ7S8/hPzG6DSuNoRIN5msN2DEMRt1nK	1	2026-01-27 11:56:37.544	f	2026-01-20 11:56:37.545
10	$2a$10$KJNO8dKzYPFqh7KWOxH/sui0mpEP7kL96BUySgmBff7X5f7BDlOhq	1	2026-01-27 12:24:23.83	f	2026-01-20 12:24:23.831
11	$2a$10$DYL7hIN2KePkyGoBRP4CPuoNBYef70gopCMuXhnxnOSiVzVroTU2W	1	2026-01-28 09:27:13.041	f	2026-01-21 09:27:13.042
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.role_permissions (id, "roleId", "permissionId") FROM stdin;
1	2	1
2	2	14
3	2	15
4	2	16
5	2	18
6	2	19
7	2	20
8	2	22
9	2	23
10	2	24
11	2	26
12	2	30
13	3	1
14	3	14
15	3	15
16	3	16
17	3	17
18	3	18
19	3	19
20	3	20
21	3	21
22	3	22
23	3	23
24	3	24
25	3	25
26	3	26
27	3	28
28	3	29
29	3	30
30	1	34
31	1	35
32	1	36
33	1	37
34	1	38
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.roles (id, name, description, "isActive", "createdAt", "updatedAt", "deletedAt", "accessScope") FROM stdin;
1	Admin	Administrator role with full access	t	2026-01-17 09:25:09.217	2026-01-17 09:25:09.217	\N	GLOBAL
2	Sales Executive	Can manage own leads/deals and view activities	t	2026-01-17 09:25:09.316	2026-01-17 09:25:09.316	\N	OWN
3	Sales Manager	Manage team leads/deals and quotations, view activities	t	2026-01-17 09:25:09.317	2026-01-17 09:25:09.317	\N	GLOBAL
\.


--
-- Data for Name: super_admin_permissions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.super_admin_permissions (id, name, key, description, module, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: super_admin_role_assignments; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.super_admin_role_assignments (id, "superAdminId", "roleId") FROM stdin;
\.


--
-- Data for Name: super_admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.super_admin_role_permissions (id, "roleId", "permissionId") FROM stdin;
\.


--
-- Data for Name: super_admin_roles; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.super_admin_roles (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: super_admins; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.super_admins (id, email, password, "firstName", "lastName", "isActive", "lastLogin", "createdAt", "updatedAt", "profilePicture") FROM stdin;
1	admin@weconnect.com	$2a$10$mVghGx2Uu1Nuiv6CrH0.MOP4BkyPOz1mRKpWLfa/Han699Rzn7J4m	Super	Admin	t	\N	2026-01-17 09:25:09.149	2026-01-17 09:25:09.149	\N
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.tags (id, name, color, description, "isActive", "createdAt", "updatedAt", "companyId") FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.tasks (id, title, description, status, priority, "dueDate", "completedAt", "assignedTo", "createdBy", "leadId", "dealId", "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.taxes (id, name, rate, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.teams (id, name, description, "managerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: terms_and_conditions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.terms_and_conditions (id, name, description, content, category, "isDefault", "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: third_party_integrations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.third_party_integrations (id, name, "displayName", description, "isActive", "apiEndpoint", "authType", config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: unit_types; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.unit_types (id, name, description, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	piece	Individual piece or item	t	2026-01-17 09:25:09.459	2026-01-17 09:25:09.459	\N
2	kg	Kilogram weight measurement	t	2026-01-17 09:25:09.461	2026-01-17 09:25:09.461	\N
3	gram	Gram weight measurement	t	2026-01-17 09:25:09.462	2026-01-17 09:25:09.462	\N
4	liter	Liter volume measurement	t	2026-01-17 09:25:09.463	2026-01-17 09:25:09.463	\N
5	meter	Meter length measurement	t	2026-01-17 09:25:09.463	2026-01-17 09:25:09.463	\N
6	box	Box packaging unit	t	2026-01-17 09:25:09.464	2026-01-17 09:25:09.464	\N
7	pack	Pack or bundle unit	t	2026-01-17 09:25:09.464	2026-01-17 09:25:09.464	\N
8	dozen	Dozen (12 units)	t	2026-01-17 09:25:09.465	2026-01-17 09:25:09.465	\N
9	unit	Generic unit measurement	t	2026-01-17 09:25:09.465	2026-01-17 09:25:09.465	\N
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.user_roles (id, "userId", "roleId") FROM stdin;
1	1	1
2	3	2
3	4	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.users (id, email, password, "firstName", "lastName", "isActive", "lastLogin", "createdAt", "updatedAt", "profilePicture", "companyId", "deletedAt", "accountLockedUntil", "emailVerificationToken", "emailVerified", "emailVerifiedAt", "failedLoginAttempts", "passwordResetExpires", "passwordResetToken", "twoFactorEnabled", "twoFactorSecret", "deviceToken", "fcmToken", "managerId", "mustChangePassword", "teamId", language, "firstNameAr", "lastNameAr") FROM stdin;
2	test@weconnect.com	$2a$10$rvFINmUXQvytClMJRl3Wl.rACx.vAmxoV3Nwk9E/FwOgGxUKO9JVe	Test	User	t	\N	2026-01-17 09:25:09.279	2026-01-17 09:25:09.279	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N	\N	f	\N	en	\N	\N
3	sales.exec@weconnect.com	$2a$10$x9cZzsfeSOw9UQerYID8bONNcbUlTyuq5keV7d7fX5.B2BSHRVXuy	Sales	Executive	t	\N	2026-01-17 09:25:09.388	2026-01-17 09:25:09.388	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N	\N	f	\N	en	\N	\N
4	sales.manager@weconnect.com	$2a$10$L6BO4XzODNWJhZ7dyA7Oj.cF9B2hAnH4YK6mD9LtnAAFA727APcYS	Sales	Manager	t	\N	2026-01-17 09:25:09.446	2026-01-17 09:25:09.446	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N	\N	f	\N	en	\N	\N
1	admin@weconnect.com	$2a$10$er7edVnFiuuNJMOVSOiVxO3YOf.8c0OD5HRndHizcfcV68okyBLhS	Admin	User	t	2026-01-21 09:27:13.047	2026-01-17 09:25:09.21	2026-01-21 09:29:46.284	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N	\N	f	\N	en	\N	\N
\.


--
-- Data for Name: voip_calls; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.voip_calls (id, "callId", "leadId", "userId", "phoneNumber", "callType", status, duration, "startTime", "endTime", "recordingUrl", region, "isRecorded", "errorMessage", "errorCode", provider, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: voip_configurations; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.voip_configurations (id, provider, "apiKey", "apiSecret", "accountSid", "authToken", regions, "defaultRegion", "enableCallRecording", "recordingStorage", "enableVideoCalls", "isActive", "createdAt", "updatedAt", metadata) FROM stdin;
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.webhooks (id, name, url, events, secret, "isActive", "companyId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: workflow_executions; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.workflow_executions (id, "workflowId", "triggerData", status, result, error, "startedAt", "completedAt", duration) FROM stdin;
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: omkardhole
--

COPY public.workflows (id, name, description, "isActive", trigger, "triggerData", conditions, actions, "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.activities_id_seq', 21, true);


--
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.budgets_id_seq', 1, false);


--
-- Name: business_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.business_settings_id_seq', 1, true);


--
-- Name: call_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.call_logs_id_seq', 1, false);


--
-- Name: communication_automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.communication_automations_id_seq', 1, false);


--
-- Name: communication_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.communication_messages_id_seq', 1, false);


--
-- Name: communication_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.communication_providers_id_seq', 1, false);


--
-- Name: communication_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.communication_templates_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, false);


--
-- Name: company_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.company_activities_id_seq', 1, false);


--
-- Name: company_communications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.company_communications_id_seq', 1, false);


--
-- Name: company_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.company_followups_id_seq', 1, false);


--
-- Name: currencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.currencies_id_seq', 1, true);


--
-- Name: deal_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.deal_products_id_seq', 1, false);


--
-- Name: deal_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.deal_statuses_id_seq', 6, true);


--
-- Name: deals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.deals_id_seq', 1, false);


--
-- Name: email_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_audit_logs_id_seq', 1, false);


--
-- Name: email_branding_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_branding_id_seq', 1, false);


--
-- Name: email_campaign_executions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_campaign_executions_id_seq', 1, false);


--
-- Name: email_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_campaigns_id_seq', 1, false);


--
-- Name: email_localizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_localizations_id_seq', 1, false);


--
-- Name: email_template_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_template_versions_id_seq', 1, false);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: field_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.field_configs_id_seq', 48, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- Name: industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.industries_id_seq', 1, false);


--
-- Name: industry_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.industry_fields_id_seq', 1, false);


--
-- Name: integration_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.integration_logs_id_seq', 1, false);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 1, false);


--
-- Name: invoice_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.invoice_templates_id_seq', 258, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_assignment_rules_id_seq', 1, false);


--
-- Name: lead_communications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_communications_id_seq', 1, false);


--
-- Name: lead_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_followups_id_seq', 1, false);


--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_import_batches_id_seq', 1, false);


--
-- Name: lead_import_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_import_records_id_seq', 1, false);


--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_integration_sync_id_seq', 1, false);


--
-- Name: lead_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_sources_id_seq', 1, false);


--
-- Name: lead_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.lead_tags_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.leads_id_seq', 7, true);


--
-- Name: login_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.login_sessions_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 2, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.notifications_id_seq', 3, true);


--
-- Name: password_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.password_history_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.permissions_id_seq', 51, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 11, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: proposal_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.proposal_templates_id_seq', 1, false);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 2, true);


--
-- Name: quotation_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.quotation_templates_id_seq', 1, false);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.quotations_id_seq', 2, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 11, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 34, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.super_admin_permissions_id_seq', 1, false);


--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.super_admin_role_assignments_id_seq', 1, false);


--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.super_admin_role_permissions_id_seq', 1, false);


--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.super_admin_roles_id_seq', 1, false);


--
-- Name: super_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.super_admins_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: taxes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.taxes_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.terms_and_conditions_id_seq', 1, false);


--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.third_party_integrations_id_seq', 1, false);


--
-- Name: unit_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.unit_types_id_seq', 9, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: voip_calls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.voip_calls_id_seq', 1, false);


--
-- Name: voip_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.voip_configurations_id_seq', 1, false);


--
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 1, false);


--
-- Name: workflow_executions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.workflow_executions_id_seq', 1, false);


--
-- Name: workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: omkardhole
--

SELECT pg_catalog.setval('public.workflows_id_seq', 1, false);


--
-- Name: _LeadToProduct _LeadToProduct_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_LeadToProduct"
    ADD CONSTRAINT "_LeadToProduct_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _TeamProducts _TeamProducts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_TeamProducts"
    ADD CONSTRAINT "_TeamProducts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: call_logs call_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_pkey PRIMARY KEY (id);


--
-- Name: communication_automations communication_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT communication_automations_pkey PRIMARY KEY (id);


--
-- Name: communication_messages communication_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT communication_messages_pkey PRIMARY KEY (id);


--
-- Name: communication_providers communication_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_providers
    ADD CONSTRAINT communication_providers_pkey PRIMARY KEY (id);


--
-- Name: communication_templates communication_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT communication_templates_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_activities company_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT company_activities_pkey PRIMARY KEY (id);


--
-- Name: company_communications company_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT company_communications_pkey PRIMARY KEY (id);


--
-- Name: company_followups company_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT company_followups_pkey PRIMARY KEY (id);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: deal_products deal_products_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deal_products
    ADD CONSTRAINT deal_products_pkey PRIMARY KEY (id);


--
-- Name: deal_statuses deal_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deal_statuses
    ADD CONSTRAINT deal_statuses_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: email_audit_logs email_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_audit_logs
    ADD CONSTRAINT email_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: email_branding email_branding_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_branding
    ADD CONSTRAINT email_branding_pkey PRIMARY KEY (id);


--
-- Name: email_campaign_executions email_campaign_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaign_executions
    ADD CONSTRAINT email_campaign_executions_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_localizations email_localizations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_localizations
    ADD CONSTRAINT email_localizations_pkey PRIMARY KEY (id);


--
-- Name: email_template_versions email_template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_template_versions
    ADD CONSTRAINT email_template_versions_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: field_configs field_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.field_configs
    ADD CONSTRAINT field_configs_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: industry_fields industry_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.industry_fields
    ADD CONSTRAINT industry_fields_pkey PRIMARY KEY (id);


--
-- Name: integration_logs integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT integration_logs_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_templates invoice_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_templates
    ADD CONSTRAINT invoice_templates_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lead_assignment_rules lead_assignment_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_assignment_rules
    ADD CONSTRAINT lead_assignment_rules_pkey PRIMARY KEY (id);


--
-- Name: lead_communications lead_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT lead_communications_pkey PRIMARY KEY (id);


--
-- Name: lead_followups lead_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT lead_followups_pkey PRIMARY KEY (id);


--
-- Name: lead_import_batches lead_import_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_batches
    ADD CONSTRAINT lead_import_batches_pkey PRIMARY KEY (id);


--
-- Name: lead_import_records lead_import_records_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT lead_import_records_pkey PRIMARY KEY (id);


--
-- Name: lead_integration_sync lead_integration_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT lead_integration_sync_pkey PRIMARY KEY (id);


--
-- Name: lead_sources lead_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT lead_sources_pkey PRIMARY KEY (id);


--
-- Name: lead_tags lead_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT lead_tags_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: login_sessions login_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT login_sessions_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_history password_history_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT password_history_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: proposal_templates proposal_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.proposal_templates
    ADD CONSTRAINT proposal_templates_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotation_templates quotation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_templates
    ADD CONSTRAINT quotation_templates_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: super_admin_permissions super_admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_permissions
    ADD CONSTRAINT super_admin_permissions_pkey PRIMARY KEY (id);


--
-- Name: super_admin_role_assignments super_admin_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT super_admin_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: super_admin_role_permissions super_admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT super_admin_role_permissions_pkey PRIMARY KEY (id);


--
-- Name: super_admin_roles super_admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_roles
    ADD CONSTRAINT super_admin_roles_pkey PRIMARY KEY (id);


--
-- Name: super_admins super_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admins
    ADD CONSTRAINT super_admins_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: terms_and_conditions terms_and_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.terms_and_conditions
    ADD CONSTRAINT terms_and_conditions_pkey PRIMARY KEY (id);


--
-- Name: third_party_integrations third_party_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.third_party_integrations
    ADD CONSTRAINT third_party_integrations_pkey PRIMARY KEY (id);


--
-- Name: unit_types unit_types_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.unit_types
    ADD CONSTRAINT unit_types_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voip_calls voip_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_calls
    ADD CONSTRAINT voip_calls_pkey PRIMARY KEY (id);


--
-- Name: voip_configurations voip_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_configurations
    ADD CONSTRAINT voip_configurations_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: _LeadToProduct_B_index; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "_LeadToProduct_B_index" ON public."_LeadToProduct" USING btree ("B");


--
-- Name: _TeamProducts_B_index; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "_TeamProducts_B_index" ON public."_TeamProducts" USING btree ("B");


--
-- Name: companies_domain_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX companies_domain_key ON public.companies USING btree (domain);


--
-- Name: companies_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX companies_name_key ON public.companies USING btree (name);


--
-- Name: companies_slug_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);


--
-- Name: currencies_code_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX currencies_code_key ON public.currencies USING btree (code);


--
-- Name: currencies_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX currencies_name_key ON public.currencies USING btree (name);


--
-- Name: deal_statuses_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX deal_statuses_name_key ON public.deal_statuses USING btree (name);


--
-- Name: email_audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_audit_logs_createdAt_idx" ON public.email_audit_logs USING btree ("createdAt");


--
-- Name: email_audit_logs_emailTemplateId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_audit_logs_emailTemplateId_idx" ON public.email_audit_logs USING btree ("emailTemplateId");


--
-- Name: email_audit_logs_leadId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_audit_logs_leadId_idx" ON public.email_audit_logs USING btree ("leadId");


--
-- Name: email_audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_audit_logs_userId_idx" ON public.email_audit_logs USING btree ("userId");


--
-- Name: email_branding_emailTemplateId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "email_branding_emailTemplateId_key" ON public.email_branding USING btree ("emailTemplateId");


--
-- Name: email_campaign_executions_campaignId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_campaign_executions_campaignId_idx" ON public.email_campaign_executions USING btree ("campaignId");


--
-- Name: email_campaign_executions_leadId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_campaign_executions_leadId_idx" ON public.email_campaign_executions USING btree ("leadId");


--
-- Name: email_campaign_executions_userId_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "email_campaign_executions_userId_idx" ON public.email_campaign_executions USING btree ("userId");


--
-- Name: email_localizations_emailTemplateId_locale_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "email_localizations_emailTemplateId_locale_key" ON public.email_localizations USING btree ("emailTemplateId", locale);


--
-- Name: email_template_versions_emailTemplateId_versionNumber_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "email_template_versions_emailTemplateId_versionNumber_key" ON public.email_template_versions USING btree ("emailTemplateId", "versionNumber");


--
-- Name: field_configs_entityType_fieldName_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "field_configs_entityType_fieldName_key" ON public.field_configs USING btree ("entityType", "fieldName");


--
-- Name: industries_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX industries_name_key ON public.industries USING btree (name);


--
-- Name: industries_slug_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX industries_slug_key ON public.industries USING btree (slug);


--
-- Name: industry_fields_industryId_key_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "industry_fields_industryId_key_key" ON public.industry_fields USING btree ("industryId", key);


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: lead_integration_sync_externalId_integrationId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "lead_integration_sync_externalId_integrationId_key" ON public.lead_integration_sync USING btree ("externalId", "integrationId");


--
-- Name: lead_integration_sync_leadId_integrationId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "lead_integration_sync_leadId_integrationId_key" ON public.lead_integration_sync USING btree ("leadId", "integrationId");


--
-- Name: lead_sources_color_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX lead_sources_color_key ON public.lead_sources USING btree (color);


--
-- Name: lead_sources_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX lead_sources_name_key ON public.lead_sources USING btree (name);


--
-- Name: lead_tags_leadId_tagId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "lead_tags_leadId_tagId_key" ON public.lead_tags USING btree ("leadId", "tagId");


--
-- Name: login_sessions_token_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX login_sessions_token_key ON public.login_sessions USING btree (token);


--
-- Name: notification_preferences_userId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "notification_preferences_userId_key" ON public.notification_preferences USING btree ("userId");


--
-- Name: notifications_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "notifications_userId_createdAt_idx" ON public.notifications USING btree ("userId", "createdAt");


--
-- Name: notifications_userId_read_idx; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE INDEX "notifications_userId_read_idx" ON public.notifications USING btree ("userId", read);


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: product_categories_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX product_categories_name_key ON public.product_categories USING btree (name);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: quotations_quotationNumber_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "quotations_quotationNumber_key" ON public.quotations USING btree ("quotationNumber");


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: super_admin_permissions_key_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX super_admin_permissions_key_key ON public.super_admin_permissions USING btree (key);


--
-- Name: super_admin_role_assignments_superAdminId_roleId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "super_admin_role_assignments_superAdminId_roleId_key" ON public.super_admin_role_assignments USING btree ("superAdminId", "roleId");


--
-- Name: super_admin_role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "super_admin_role_permissions_roleId_permissionId_key" ON public.super_admin_role_permissions USING btree ("roleId", "permissionId");


--
-- Name: super_admin_roles_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX super_admin_roles_name_key ON public.super_admin_roles USING btree (name);


--
-- Name: super_admins_email_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX super_admins_email_key ON public.super_admins USING btree (email);


--
-- Name: tags_color_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX tags_color_key ON public.tags USING btree (color);


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: third_party_integrations_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX third_party_integrations_name_key ON public.third_party_integrations USING btree (name);


--
-- Name: unit_types_name_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX unit_types_name_key ON public.unit_types USING btree (name);


--
-- Name: user_roles_userId_roleId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON public.user_roles USING btree ("userId", "roleId");


--
-- Name: users_emailVerificationToken_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON public.users USING btree ("emailVerificationToken");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_passwordResetToken_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "users_passwordResetToken_key" ON public.users USING btree ("passwordResetToken");


--
-- Name: voip_calls_callId_key; Type: INDEX; Schema: public; Owner: omkardhole
--

CREATE UNIQUE INDEX "voip_calls_callId_key" ON public.voip_calls USING btree ("callId");


--
-- Name: _LeadToProduct _LeadToProduct_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_LeadToProduct"
    ADD CONSTRAINT "_LeadToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _LeadToProduct _LeadToProduct_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_LeadToProduct"
    ADD CONSTRAINT "_LeadToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TeamProducts _TeamProducts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_TeamProducts"
    ADD CONSTRAINT "_TeamProducts_A_fkey" FOREIGN KEY ("A") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _TeamProducts _TeamProducts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public."_TeamProducts"
    ADD CONSTRAINT "_TeamProducts_B_fkey" FOREIGN KEY ("B") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activities activities_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_superAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES public.super_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: budgets budgets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: call_logs call_logs_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT "call_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: call_logs call_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT "call_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_automations communication_automations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_automations communication_automations_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_automations communication_automations_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.communication_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: communication_messages communication_messages_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: communication_messages communication_messages_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.communication_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_messages communication_messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_providers communication_providers_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_providers
    ADD CONSTRAINT "communication_providers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_templates communication_templates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT "communication_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_templates communication_templates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT "communication_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: companies companies_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public.industries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_parentCompanyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_activities company_activities_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT "company_activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_activities company_activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT "company_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_communications company_communications_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT "company_communications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_communications company_communications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT "company_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: company_followups company_followups_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT "company_followups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_followups company_followups_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT "company_followups_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deal_products deal_products_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deal_products
    ADD CONSTRAINT "deal_products_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deals deals_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deals deals_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deals deals_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deals deals_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_audit_logs email_audit_logs_emailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_audit_logs
    ADD CONSTRAINT "email_audit_logs_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_branding email_branding_emailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_branding
    ADD CONSTRAINT "email_branding_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaign_executions email_campaign_executions_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaign_executions
    ADD CONSTRAINT "email_campaign_executions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.email_campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaigns email_campaigns_emailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT "email_campaigns_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_localizations email_localizations_emailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_localizations
    ADD CONSTRAINT "email_localizations_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_template_versions email_template_versions_emailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.email_template_versions
    ADD CONSTRAINT "email_template_versions_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_rejectedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_submittedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: files files_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: industry_fields industry_fields_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.industry_fields
    ADD CONSTRAINT "industry_fields_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public.industries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: integration_logs integration_logs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT "integration_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public.third_party_integrations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_communications lead_communications_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT "lead_communications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_communications lead_communications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT "lead_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_followups lead_followups_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT "lead_followups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_followups lead_followups_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT "lead_followups_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_import_batches lead_import_batches_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_batches
    ADD CONSTRAINT "lead_import_batches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_import_records lead_import_records_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT "lead_import_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public.lead_import_batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_import_records lead_import_records_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT "lead_import_records_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_integration_sync lead_integration_sync_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT "lead_integration_sync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public.third_party_integrations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_integration_sync lead_integration_sync_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT "lead_integration_sync_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_sources lead_sources_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT "lead_sources_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_tags lead_tags_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT "lead_tags_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_tags lead_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT "lead_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leads leads_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public.lead_sources(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: login_sessions login_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notes notes_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "notes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notes notes_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_history password_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotation_items quotation_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "quotation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotation_items quotation_items_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_assignments super_admin_role_assignments_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT "super_admin_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.super_admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_assignments super_admin_role_assignments_superAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT "super_admin_role_assignments_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES public.super_admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_permissions super_admin_role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT "super_admin_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.super_admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_permissions super_admin_role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT "super_admin_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.super_admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tags tags_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "teams_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: voip_calls voip_calls_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_calls
    ADD CONSTRAINT "voip_calls_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voip_calls voip_calls_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.voip_calls
    ADD CONSTRAINT "voip_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: webhooks webhooks_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT "webhooks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_executions workflow_executions_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: omkardhole
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Jc78e9J3Epw2RV0PvDA6NTn73upouFqC5xaTHC0gXAfPk1EfzcSu2G21dynLivz

