--
-- PostgreSQL database dump
--

\restrict uBUNOh9Net9873LIOMQvnNdTp3OWKAm1apE0Vu9wl1EsxaSzUeYe8FMfIrESkjm

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."ActivityType" OWNER TO weconnect_user;

--
-- Name: BudgetPeriod; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."BudgetPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'HALF_YEARLY',
    'ANNUAL',
    'CUSTOM'
);


ALTER TYPE public."BudgetPeriod" OWNER TO weconnect_user;

--
-- Name: BudgetType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."BudgetType" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'ANNUAL',
    'PROJECT',
    'DEPARTMENT',
    'CAMPAIGN'
);


ALTER TYPE public."BudgetType" OWNER TO weconnect_user;

--
-- Name: CallStatus; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."CallStatus" OWNER TO weconnect_user;

--
-- Name: CallType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."CallType" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."CallType" OWNER TO weconnect_user;

--
-- Name: CommunicationType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."CommunicationType" AS ENUM (
    'CALL',
    'EMAIL',
    'SMS',
    'MEETING',
    'NOTE'
);


ALTER TYPE public."CommunicationType" OWNER TO weconnect_user;

--
-- Name: CompanyActivityType; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."CompanyActivityType" OWNER TO weconnect_user;

--
-- Name: CompanySize; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."CompanySize" AS ENUM (
    'STARTUP',
    'SMALL',
    'MEDIUM',
    'LARGE',
    'ENTERPRISE'
);


ALTER TYPE public."CompanySize" OWNER TO weconnect_user;

--
-- Name: CompanyStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."CompanyStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PROSPECT',
    'CUSTOMER',
    'PARTNER',
    'COMPETITOR'
);


ALTER TYPE public."CompanyStatus" OWNER TO weconnect_user;

--
-- Name: DealStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."DealStatus" AS ENUM (
    'DRAFT',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST'
);


ALTER TYPE public."DealStatus" OWNER TO weconnect_user;

--
-- Name: ExpenseStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."ExpenseStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REIMBURSED'
);


ALTER TYPE public."ExpenseStatus" OWNER TO weconnect_user;

--
-- Name: ExpenseType; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."ExpenseType" OWNER TO weconnect_user;

--
-- Name: FieldType; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."FieldType" OWNER TO weconnect_user;

--
-- Name: IntegrationAuthType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."IntegrationAuthType" AS ENUM (
    'API_KEY',
    'OAUTH',
    'TOKEN'
);


ALTER TYPE public."IntegrationAuthType" OWNER TO weconnect_user;

--
-- Name: IntegrationLogStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."IntegrationLogStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."IntegrationLogStatus" OWNER TO weconnect_user;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."InvoiceStatus" OWNER TO weconnect_user;

--
-- Name: LeadImportStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."LeadImportStatus" AS ENUM (
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."LeadImportStatus" OWNER TO weconnect_user;

--
-- Name: LeadPriority; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."LeadPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."LeadPriority" OWNER TO weconnect_user;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."LeadStatus" OWNER TO weconnect_user;

--
-- Name: LeadSyncStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."LeadSyncStatus" AS ENUM (
    'SYNCED',
    'PENDING',
    'FAILED',
    'CONFLICT'
);


ALTER TYPE public."LeadSyncStatus" OWNER TO weconnect_user;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."MessageStatus" OWNER TO weconnect_user;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: weconnect_user
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
    'SYSTEM'
);


ALTER TYPE public."NotificationType" OWNER TO weconnect_user;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."ProductType" AS ENUM (
    'PHYSICAL',
    'DIGITAL',
    'SERVICE'
);


ALTER TYPE public."ProductType" OWNER TO weconnect_user;

--
-- Name: QuotationStatus; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."QuotationStatus" OWNER TO weconnect_user;

--
-- Name: RoleAccessScope; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."RoleAccessScope" AS ENUM (
    'OWN',
    'GLOBAL'
);


ALTER TYPE public."RoleAccessScope" OWNER TO weconnect_user;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO weconnect_user;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO weconnect_user;

--
-- Name: TemplateType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."TemplateType" AS ENUM (
    'EMAIL',
    'WHATSAPP',
    'SMS'
);


ALTER TYPE public."TemplateType" OWNER TO weconnect_user;

--
-- Name: TriggerType; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."TriggerType" AS ENUM (
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_STATUS_CHANGED',
    'LEAD_ASSIGNED',
    'MANUAL'
);


ALTER TYPE public."TriggerType" OWNER TO weconnect_user;

--
-- Name: WorkflowExecutionStatus; Type: TYPE; Schema: public; Owner: weconnect_user
--

CREATE TYPE public."WorkflowExecutionStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'SUCCESS',
    'FAILED',
    'SKIPPED'
);


ALTER TYPE public."WorkflowExecutionStatus" OWNER TO weconnect_user;

--
-- Name: WorkflowTrigger; Type: TYPE; Schema: public; Owner: weconnect_user
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


ALTER TYPE public."WorkflowTrigger" OWNER TO weconnect_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public._prisma_migrations OWNER TO weconnect_user;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.activities OWNER TO weconnect_user;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO weconnect_user;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.budgets OWNER TO weconnect_user;

--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budgets_id_seq OWNER TO weconnect_user;

--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: weconnect_user
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
    description text
);


ALTER TABLE public.business_settings OWNER TO weconnect_user;

--
-- Name: business_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.business_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.business_settings_id_seq OWNER TO weconnect_user;

--
-- Name: business_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.business_settings_id_seq OWNED BY public.business_settings.id;


--
-- Name: call_logs; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.call_logs OWNER TO weconnect_user;

--
-- Name: call_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.call_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.call_logs_id_seq OWNER TO weconnect_user;

--
-- Name: call_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.call_logs_id_seq OWNED BY public.call_logs.id;


--
-- Name: communication_automations; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.communication_automations OWNER TO weconnect_user;

--
-- Name: communication_automations_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.communication_automations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_automations_id_seq OWNER TO weconnect_user;

--
-- Name: communication_automations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.communication_automations_id_seq OWNED BY public.communication_automations.id;


--
-- Name: communication_messages; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.communication_messages OWNER TO weconnect_user;

--
-- Name: communication_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.communication_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_messages_id_seq OWNER TO weconnect_user;

--
-- Name: communication_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.communication_messages_id_seq OWNED BY public.communication_messages.id;


--
-- Name: communication_providers; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.communication_providers OWNER TO weconnect_user;

--
-- Name: communication_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.communication_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_providers_id_seq OWNER TO weconnect_user;

--
-- Name: communication_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.communication_providers_id_seq OWNED BY public.communication_providers.id;


--
-- Name: communication_templates; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.communication_templates OWNER TO weconnect_user;

--
-- Name: communication_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.communication_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communication_templates_id_seq OWNER TO weconnect_user;

--
-- Name: communication_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.communication_templates_id_seq OWNED BY public.communication_templates.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: weconnect_user
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
    "zipCode" text
);


ALTER TABLE public.companies OWNER TO weconnect_user;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO weconnect_user;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_activities; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.company_activities OWNER TO weconnect_user;

--
-- Name: company_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.company_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_activities_id_seq OWNER TO weconnect_user;

--
-- Name: company_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.company_activities_id_seq OWNED BY public.company_activities.id;


--
-- Name: company_communications; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.company_communications OWNER TO weconnect_user;

--
-- Name: company_communications_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.company_communications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_communications_id_seq OWNER TO weconnect_user;

--
-- Name: company_communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.company_communications_id_seq OWNED BY public.company_communications.id;


--
-- Name: company_followups; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.company_followups OWNER TO weconnect_user;

--
-- Name: company_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.company_followups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_followups_id_seq OWNER TO weconnect_user;

--
-- Name: company_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.company_followups_id_seq OWNED BY public.company_followups.id;


--
-- Name: deal_products; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.deal_products (
    id integer NOT NULL,
    "dealId" integer NOT NULL,
    name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.deal_products OWNER TO weconnect_user;

--
-- Name: deal_products_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.deal_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deal_products_id_seq OWNER TO weconnect_user;

--
-- Name: deal_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.deal_products_id_seq OWNED BY public.deal_products.id;


--
-- Name: deals; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.deals (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    value numeric(65,30) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status public."DealStatus" DEFAULT 'DRAFT'::public."DealStatus" NOT NULL,
    probability integer DEFAULT 0 NOT NULL,
    "expectedCloseDate" timestamp(3) without time zone,
    "actualCloseDate" timestamp(3) without time zone,
    "assignedTo" integer,
    "leadId" integer,
    "companyId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.deals OWNER TO weconnect_user;

--
-- Name: deals_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.deals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deals_id_seq OWNER TO weconnect_user;

--
-- Name: deals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.deals_id_seq OWNED BY public.deals.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.expenses OWNER TO weconnect_user;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_id_seq OWNER TO weconnect_user;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.files OWNER TO weconnect_user;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO weconnect_user;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: industries; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.industries (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.industries OWNER TO weconnect_user;

--
-- Name: industries_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.industries_id_seq OWNER TO weconnect_user;

--
-- Name: industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.industries_id_seq OWNED BY public.industries.id;


--
-- Name: industry_fields; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.industry_fields OWNER TO weconnect_user;

--
-- Name: industry_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.industry_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.industry_fields_id_seq OWNER TO weconnect_user;

--
-- Name: industry_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.industry_fields_id_seq OWNED BY public.industry_fields.id;


--
-- Name: integration_logs; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.integration_logs OWNER TO weconnect_user;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.integration_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integration_logs_id_seq OWNER TO weconnect_user;

--
-- Name: integration_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.integration_logs_id_seq OWNED BY public.integration_logs.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.invoice_items OWNER TO weconnect_user;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_items_id_seq OWNER TO weconnect_user;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.invoices OWNER TO weconnect_user;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_id_seq OWNER TO weconnect_user;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: lead_assignment_rules; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_assignment_rules OWNER TO weconnect_user;

--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_assignment_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_assignment_rules_id_seq OWNER TO weconnect_user;

--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_assignment_rules_id_seq OWNED BY public.lead_assignment_rules.id;


--
-- Name: lead_communications; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_communications OWNER TO weconnect_user;

--
-- Name: lead_communications_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_communications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_communications_id_seq OWNER TO weconnect_user;

--
-- Name: lead_communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_communications_id_seq OWNED BY public.lead_communications.id;


--
-- Name: lead_followups; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_followups OWNER TO weconnect_user;

--
-- Name: lead_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_followups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_followups_id_seq OWNER TO weconnect_user;

--
-- Name: lead_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_followups_id_seq OWNED BY public.lead_followups.id;


--
-- Name: lead_import_batches; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_import_batches OWNER TO weconnect_user;

--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_import_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_import_batches_id_seq OWNER TO weconnect_user;

--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_import_batches_id_seq OWNED BY public.lead_import_batches.id;


--
-- Name: lead_import_records; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_import_records OWNER TO weconnect_user;

--
-- Name: lead_import_records_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_import_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_import_records_id_seq OWNER TO weconnect_user;

--
-- Name: lead_import_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_import_records_id_seq OWNED BY public.lead_import_records.id;


--
-- Name: lead_integration_sync; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.lead_integration_sync OWNER TO weconnect_user;

--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_integration_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_integration_sync_id_seq OWNER TO weconnect_user;

--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_integration_sync_id_seq OWNED BY public.lead_integration_sync.id;


--
-- Name: lead_sources; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.lead_sources (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "companyId" integer
);


ALTER TABLE public.lead_sources OWNER TO weconnect_user;

--
-- Name: lead_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_sources_id_seq OWNER TO weconnect_user;

--
-- Name: lead_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_sources_id_seq OWNED BY public.lead_sources.id;


--
-- Name: lead_tags; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.lead_tags (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public.lead_tags OWNER TO weconnect_user;

--
-- Name: lead_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.lead_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lead_tags_id_seq OWNER TO weconnect_user;

--
-- Name: lead_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.lead_tags_id_seq OWNED BY public.lead_tags.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
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
    "previousStatus" public."LeadStatus"
);


ALTER TABLE public.leads OWNER TO weconnect_user;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leads_id_seq OWNER TO weconnect_user;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: login_sessions; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.login_sessions OWNER TO weconnect_user;

--
-- Name: login_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.login_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_sessions_id_seq OWNER TO weconnect_user;

--
-- Name: login_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.login_sessions_id_seq OWNED BY public.login_sessions.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.notes OWNER TO weconnect_user;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notes_id_seq OWNER TO weconnect_user;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.notification_preferences OWNER TO weconnect_user;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_preferences_id_seq OWNER TO weconnect_user;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.notifications OWNER TO weconnect_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO weconnect_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_history; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.password_history (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_history OWNER TO weconnect_user;

--
-- Name: password_history_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.password_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_history_id_seq OWNER TO weconnect_user;

--
-- Name: password_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.password_history_id_seq OWNED BY public.password_history.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.payments OWNER TO weconnect_user;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO weconnect_user;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.permissions OWNER TO weconnect_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO weconnect_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: weconnect_user
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
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.products OWNER TO weconnect_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO weconnect_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: proposal_templates; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.proposal_templates OWNER TO weconnect_user;

--
-- Name: proposal_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.proposal_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proposal_templates_id_seq OWNER TO weconnect_user;

--
-- Name: proposal_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.proposal_templates_id_seq OWNED BY public.proposal_templates.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.quotation_items OWNER TO weconnect_user;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotation_items_id_seq OWNER TO weconnect_user;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- Name: quotation_templates; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.quotation_templates OWNER TO weconnect_user;

--
-- Name: quotation_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.quotation_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotation_templates_id_seq OWNER TO weconnect_user;

--
-- Name: quotation_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.quotation_templates_id_seq OWNED BY public.quotation_templates.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.quotations OWNER TO weconnect_user;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quotations_id_seq OWNER TO weconnect_user;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    "userId" integer NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO weconnect_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.refresh_tokens_id_seq OWNER TO weconnect_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO weconnect_user;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permissions_id_seq OWNER TO weconnect_user;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.roles OWNER TO weconnect_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO weconnect_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: super_admin_permissions; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.super_admin_permissions OWNER TO weconnect_user;

--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.super_admin_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_permissions_id_seq OWNER TO weconnect_user;

--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.super_admin_permissions_id_seq OWNED BY public.super_admin_permissions.id;


--
-- Name: super_admin_role_assignments; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.super_admin_role_assignments (
    id integer NOT NULL,
    "superAdminId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.super_admin_role_assignments OWNER TO weconnect_user;

--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.super_admin_role_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_role_assignments_id_seq OWNER TO weconnect_user;

--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.super_admin_role_assignments_id_seq OWNED BY public.super_admin_role_assignments.id;


--
-- Name: super_admin_role_permissions; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.super_admin_role_permissions (
    id integer NOT NULL,
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE public.super_admin_role_permissions OWNER TO weconnect_user;

--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.super_admin_role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_role_permissions_id_seq OWNER TO weconnect_user;

--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.super_admin_role_permissions_id_seq OWNED BY public.super_admin_role_permissions.id;


--
-- Name: super_admin_roles; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.super_admin_roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.super_admin_roles OWNER TO weconnect_user;

--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.super_admin_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admin_roles_id_seq OWNER TO weconnect_user;

--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.super_admin_roles_id_seq OWNED BY public.super_admin_roles.id;


--
-- Name: super_admins; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.super_admins OWNER TO weconnect_user;

--
-- Name: super_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.super_admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.super_admins_id_seq OWNER TO weconnect_user;

--
-- Name: super_admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.super_admins_id_seq OWNED BY public.super_admins.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "companyId" integer
);


ALTER TABLE public.tags OWNER TO weconnect_user;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO weconnect_user;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.tasks OWNER TO weconnect_user;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO weconnect_user;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: third_party_integrations; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.third_party_integrations OWNER TO weconnect_user;

--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.third_party_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.third_party_integrations_id_seq OWNER TO weconnect_user;

--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.third_party_integrations_id_seq OWNED BY public.third_party_integrations.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: weconnect_user
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO weconnect_user;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_seq OWNER TO weconnect_user;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: weconnect_user
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
    "managerId" integer,
    "dateOfBirth" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO weconnect_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO weconnect_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workflow_executions; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.workflow_executions OWNER TO weconnect_user;

--
-- Name: workflow_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.workflow_executions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.workflow_executions_id_seq OWNER TO weconnect_user;

--
-- Name: workflow_executions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.workflow_executions_id_seq OWNED BY public.workflow_executions.id;


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: weconnect_user
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


ALTER TABLE public.workflows OWNER TO weconnect_user;

--
-- Name: workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: weconnect_user
--

CREATE SEQUENCE public.workflows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.workflows_id_seq OWNER TO weconnect_user;

--
-- Name: workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: weconnect_user
--

ALTER SEQUENCE public.workflows_id_seq OWNED BY public.workflows.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: business_settings id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.business_settings ALTER COLUMN id SET DEFAULT nextval('public.business_settings_id_seq'::regclass);


--
-- Name: call_logs id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.call_logs ALTER COLUMN id SET DEFAULT nextval('public.call_logs_id_seq'::regclass);


--
-- Name: communication_automations id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_automations ALTER COLUMN id SET DEFAULT nextval('public.communication_automations_id_seq'::regclass);


--
-- Name: communication_messages id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_messages ALTER COLUMN id SET DEFAULT nextval('public.communication_messages_id_seq'::regclass);


--
-- Name: communication_providers id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_providers ALTER COLUMN id SET DEFAULT nextval('public.communication_providers_id_seq'::regclass);


--
-- Name: communication_templates id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_templates ALTER COLUMN id SET DEFAULT nextval('public.communication_templates_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_activities id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_activities ALTER COLUMN id SET DEFAULT nextval('public.company_activities_id_seq'::regclass);


--
-- Name: company_communications id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_communications ALTER COLUMN id SET DEFAULT nextval('public.company_communications_id_seq'::regclass);


--
-- Name: company_followups id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_followups ALTER COLUMN id SET DEFAULT nextval('public.company_followups_id_seq'::regclass);


--
-- Name: deal_products id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deal_products ALTER COLUMN id SET DEFAULT nextval('public.deal_products_id_seq'::regclass);


--
-- Name: deals id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deals ALTER COLUMN id SET DEFAULT nextval('public.deals_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: industries id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.industries ALTER COLUMN id SET DEFAULT nextval('public.industries_id_seq'::regclass);


--
-- Name: industry_fields id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.industry_fields ALTER COLUMN id SET DEFAULT nextval('public.industry_fields_id_seq'::regclass);


--
-- Name: integration_logs id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.integration_logs ALTER COLUMN id SET DEFAULT nextval('public.integration_logs_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: lead_assignment_rules id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_assignment_rules ALTER COLUMN id SET DEFAULT nextval('public.lead_assignment_rules_id_seq'::regclass);


--
-- Name: lead_communications id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_communications ALTER COLUMN id SET DEFAULT nextval('public.lead_communications_id_seq'::regclass);


--
-- Name: lead_followups id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_followups ALTER COLUMN id SET DEFAULT nextval('public.lead_followups_id_seq'::regclass);


--
-- Name: lead_import_batches id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_batches ALTER COLUMN id SET DEFAULT nextval('public.lead_import_batches_id_seq'::regclass);


--
-- Name: lead_import_records id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_records ALTER COLUMN id SET DEFAULT nextval('public.lead_import_records_id_seq'::regclass);


--
-- Name: lead_integration_sync id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_integration_sync ALTER COLUMN id SET DEFAULT nextval('public.lead_integration_sync_id_seq'::regclass);


--
-- Name: lead_sources id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_sources ALTER COLUMN id SET DEFAULT nextval('public.lead_sources_id_seq'::regclass);


--
-- Name: lead_tags id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_tags ALTER COLUMN id SET DEFAULT nextval('public.lead_tags_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: login_sessions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.login_sessions ALTER COLUMN id SET DEFAULT nextval('public.login_sessions_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_history id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.password_history ALTER COLUMN id SET DEFAULT nextval('public.password_history_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: proposal_templates id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.proposal_templates ALTER COLUMN id SET DEFAULT nextval('public.proposal_templates_id_seq'::regclass);


--
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- Name: quotation_templates id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_templates ALTER COLUMN id SET DEFAULT nextval('public.quotation_templates_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: super_admin_permissions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_permissions ALTER COLUMN id SET DEFAULT nextval('public.super_admin_permissions_id_seq'::regclass);


--
-- Name: super_admin_role_assignments id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_assignments ALTER COLUMN id SET DEFAULT nextval('public.super_admin_role_assignments_id_seq'::regclass);


--
-- Name: super_admin_role_permissions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_permissions ALTER COLUMN id SET DEFAULT nextval('public.super_admin_role_permissions_id_seq'::regclass);


--
-- Name: super_admin_roles id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_roles ALTER COLUMN id SET DEFAULT nextval('public.super_admin_roles_id_seq'::regclass);


--
-- Name: super_admins id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admins ALTER COLUMN id SET DEFAULT nextval('public.super_admins_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: third_party_integrations id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.third_party_integrations ALTER COLUMN id SET DEFAULT nextval('public.third_party_integrations_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workflow_executions id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.workflow_executions ALTER COLUMN id SET DEFAULT nextval('public.workflow_executions_id_seq'::regclass);


--
-- Name: workflows id; Type: DEFAULT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.workflows ALTER COLUMN id SET DEFAULT nextval('public.workflows_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c3539d83-bd98-44bb-9e73-f2f013be9757	06fcf0e7b72946c1e93ac8cead83a6996c63c0e9ce92f9fa67ec9a41ed9eabc7	2025-11-08 11:23:23.259017+05:30	20251028180021_init	\N	\N	2025-11-08 11:23:23.137827+05:30	1
85dc317b-d785-4a11-aeab-72ef172f5774	7b8f190cfd78f4c891ceab4723237834df72cbfbb17e8f46682ed61dd9fc6c73	2025-11-08 11:23:23.260341+05:30	20251101054853_add_role_access_scope	\N	\N	2025-11-08 11:23:23.259211+05:30	1
daf0947e-7e8f-4a95-84a9-2d45714a9a0b	9500552e13cc0d51674275709fc28e556c848aba0cc8441f0d5d17ed4002c7ce	2025-11-08 11:23:23.26778+05:30	20251105061358_remove_contact_module	\N	\N	2025-11-08 11:23:23.260527+05:30	1
6604396f-e1fc-4134-878c-244cc4e21c6c	54a0dca3214f5a387e1cc69e7ddd9e65f538fa6172ced3846eb9423e608a53cc	2025-11-08 11:23:23.269174+05:30	20251105071011_add_lead_conversion_tracking	\N	\N	2025-11-08 11:23:23.267929+05:30	1
b0bacfcb-8b5a-4735-a2ec-8689ad9503b2	9d1929baef4eaf57ac086968bb955b4689b2086477a390e39a1542787037b866	2025-11-08 11:23:23.270079+05:30	20251105125802_add_lead_relation_to_activity	\N	\N	2025-11-08 11:23:23.26931+05:30	1
31a3a3d0-764f-4fcd-99b1-428cd8ca33e8	f1b71239a0400751401129f58a8072eed322d2429eac13b91373e951f3418d51	2025-11-08 11:23:23.270584+05:30	20251106120000_add_previous_status_manual	\N	\N	2025-11-08 11:23:23.270198+05:30	1
3b6d7b4d-93f9-4315-8b3b-3790bba58fbb	392db476bd955ed1249884dcfe447eeab446c5fd54337cdacd47f6fa28eb8df8	2025-11-08 11:23:23.273286+05:30	20251106130000_add_notes_table_manual	\N	\N	2025-11-08 11:23:23.27071+05:30	1
b525af18-3de3-4366-8ff5-3ff9d8dfc60a	784d7ff9dfce3d73a43a5906ff218bf8a448fefdcc51b1a037edb6b8fc05e866	2025-11-08 11:23:23.278116+05:30	20251107000000_add_expenses_table_manual	\N	\N	2025-11-08 11:23:23.273432+05:30	1
527f6b59-0302-4d24-b5ba-aac2d6dbf8ea	6f2263896281b893cb1a1e8a39d8186feff93d421308d1a45122119466fd96e3	2025-11-08 11:23:23.278824+05:30	20251107180000_add_approved_at_to_expenses	\N	\N	2025-11-08 11:23:23.278286+05:30	1
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.activities (id, title, description, type, icon, "iconColor", tags, metadata, "createdAt", "updatedAt", "userId", "superAdminId", "leadId") FROM stdin;
1	Status changed	Status: new → contacted, Priority: medium → high, Assigned to: Admin User, Budget: N/A → 100000	LEAD_STATUS_CHANGED	TrendingUp	#10B981	{}	{"leadId": 1, "changes": ["Status: new → contacted", "Priority: medium → high", "Assigned to: Admin User", "Budget: N/A → 100000"], "newStatus": "CONTACTED", "oldStatus": "NEW", "newPriority": "HIGH", "oldPriority": "MEDIUM", "newAssignedTo": 1, "oldAssignedTo": null}	2025-11-09 08:21:06.325	2025-11-09 08:21:06.325	1	\N	1
2	Note added	Note "Call " added	COMMUNICATION_LOGGED	MessageSquare	#6B7280	{}	{"title": "Call ", "noteId": 1}	2025-11-09 08:21:44.921	2025-11-09 08:21:44.921	1	\N	1
3	Lead updated	Lead information updated	LEAD_UPDATED	Edit	#6B7280	{}	{"leadId": 1, "changes": [], "newStatus": "CONTACTED", "oldStatus": "CONTACTED", "newPriority": "HIGH", "oldPriority": "HIGH", "newAssignedTo": 1, "oldAssignedTo": 1}	2025-11-09 08:22:54.442	2025-11-09 08:22:54.442	1	\N	1
4	Status changed	Status: converted → contacted	LEAD_STATUS_CHANGED	TrendingUp	#10B981	{}	{"leadId": 1, "changes": ["Status: converted → contacted"], "newStatus": "CONTACTED", "oldStatus": "CONVERTED", "newPriority": "HIGH", "oldPriority": "HIGH", "newAssignedTo": 1, "oldAssignedTo": 1}	2025-11-09 08:25:22.576	2025-11-09 08:25:22.576	1	\N	1
5	Quotation created	Quotation "Q-000001" created with total amount INR 110.00	COMMUNICATION_LOGGED	FileText	#10B981	{}	{"currency": "INR", "quotationId": 1, "totalAmount": 110, "quotationNumber": "Q-000001"}	2025-11-09 09:04:25.474	2025-11-09 09:04:25.474	1	\N	1
6	Note added	Note "Hi " added	COMMUNICATION_LOGGED	MessageSquare	#6B7280	{}	{"title": "Hi ", "noteId": 2}	2025-11-10 12:08:16.674	2025-11-10 12:08:16.674	1	\N	2
7	File uploaded	File "sample.pdf" uploaded (18.37 KB)	COMMUNICATION_LOGGED	FileText	#3B82F6	{}	{"fileId": 1, "fileName": "sample.pdf", "fileSize": 18810, "mimeType": "application/pdf"}	2025-11-10 12:09:00.554	2025-11-10 12:09:00.554	1	\N	2
8	Quotation created	Quotation "Q-000002" created with total amount INR 10000.00	COMMUNICATION_LOGGED	FileText	#10B981	{}	{"currency": "INR", "quotationId": 2, "totalAmount": 10000, "quotationNumber": "Q-000002"}	2025-11-10 12:09:41.665	2025-11-10 12:09:41.665	1	\N	2
9	Expense approved	Your expense #1 has been approved.	COMMUNICATION_LOGGED	DollarSign	#10B981	{}	{"amount": 1000, "status": "APPROVED", "expenseId": 1}	2025-11-10 12:15:03.285	2025-11-10 12:15:03.285	1	\N	\N
10	Status changed	Status: contacted → qualified	LEAD_STATUS_CHANGED	TrendingUp	#10B981	{}	{"leadId": 2, "changes": ["Status: contacted → qualified"], "newStatus": "QUALIFIED", "oldStatus": "CONTACTED", "newPriority": "MEDIUM", "oldPriority": "MEDIUM", "newAssignedTo": 1, "oldAssignedTo": 1}	2025-11-10 18:34:55.814	2025-11-10 18:34:55.814	1	\N	2
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.budgets (id, name, description, "budgetType", amount, spent, period, "startDate", "endDate", "expenseType", "projectId", "departmentId", currency, "isActive", "alertThreshold", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.business_settings (id, "companyName", "companyEmail", "companyPhone", "companyAddress", "companyWebsite", "companyLogo", "timeZone", "dateFormat", currency, "passwordMinLength", "passwordRequireUpper", "passwordRequireLower", "passwordRequireNumber", "passwordRequireSymbol", "sessionTimeout", "maxLoginAttempts", "accountLockDuration", "twoFactorRequired", "emailVerificationRequired", "createdAt", "updatedAt", "leadAutoAssignmentEnabled", "leadFollowUpReminderDays", "metaAdsApiKey", "metaAdsApiSecret", "metaAdsEnabled", "indiamartApiKey", "indiamartApiSecret", "indiamartEnabled", "tradindiaApiKey", "tradindiaApiSecret", "tradindiaEnabled", "gstNumber", "panNumber", "cinNumber", "fiscalYearStart", industry, "employeeCount", description) FROM stdin;
1	Your Company	\N	\N	\N	\N	\N	UTC	MM/DD/YYYY	USD	8	t	t	t	f	24	5	30	f	t	2025-11-08 05:58:15.083	2025-11-08 05:58:15.083	f	3	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: call_logs; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.call_logs (id, "leadId", "userId", "phoneNumber", "callType", "callStatus", duration, "startTime", "endTime", notes, outcome, "recordingUrl", "isAnswered", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_automations; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.communication_automations (id, name, "triggerType", "templateId", "isActive", conditions, delay, "companyId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: communication_messages; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.communication_messages (id, "leadId", "userId", "templateId", type, recipient, subject, content, status, "sentAt", "deliveredAt", "readAt", "failedAt", "errorMessage", "externalId", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_providers; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.communication_providers (id, name, type, config, "isActive", "isDefault", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: communication_templates; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.communication_templates (id, name, type, subject, content, variables, "isActive", "isDefault", "companyId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.companies (id, name, "createdAt", "updatedAt", domain, "isActive", slug, "industryId", address, "alternatePhone", "annualRevenue", "assignedTo", city, "companySize", country, currency, "deletedAt", description, email, "employeeCount", "facebookPage", "foundedYear", "lastContactedAt", "leadScore", "linkedinProfile", "nextFollowUpAt", notes, "parentCompanyId", phone, state, status, tags, timezone, "twitterHandle", website, "zipCode") FROM stdin;
\.


--
-- Data for Name: company_activities; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.company_activities (id, "companyId", "userId", type, title, description, duration, outcome, "scheduledAt", "completedAt", "isCompleted", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_communications; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.company_communications (id, "companyId", "userId", type, subject, content, direction, status, "scheduledAt", "sentAt", "deliveredAt", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_followups; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.company_followups (id, "companyId", "userId", type, subject, notes, priority, "scheduledAt", "completedAt", "isCompleted", "reminderSet", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deal_products; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.deal_products (id, "dealId", name, quantity, price) FROM stdin;
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.deals (id, title, description, value, currency, status, probability, "expectedCloseDate", "actualCloseDate", "assignedTo", "leadId", "companyId", "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Deal with Mohit  Shrivastava	Deal opportunity from lead conversion	100000.000000000000000000000000000000	INR	DRAFT	50	\N	\N	1	1	\N	t	2025-11-09 08:23:44.7	2025-11-09 10:24:08.12	2025-11-09 10:24:08.114
2	Deal with Mohit  Shrivastava	Deal opportunity from lead conversion	100000.000000000000000000000000000000	INR	PROPOSAL	20	2025-11-18 00:00:00	\N	1	1	\N	t	2025-11-10 11:47:38.929	2025-11-10 18:35:03.017	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.expenses (id, "expenseDate", amount, type, category, description, remarks, "receiptUrl", status, "submittedBy", "approvedBy", "rejectedBy", "approvalRemarks", "projectId", "dealId", "leadId", currency, "isActive", "createdAt", "updatedAt", "deletedAt", "approvedAt") FROM stdin;
1	2025-11-09 18:30:00	1000.00	MEALS	MEALS	Test	Test	/files/2/download?disposition=inline	APPROVED	1	1	\N	Yes	\N	\N	\N	INR	t	2025-11-10 12:14:48.1	2025-11-10 12:15:03.27	\N	2025-11-10 12:15:03.27
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.files (id, name, "fileName", "filePath", "fileSize", "mimeType", "entityType", "entityId", "uploadedBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	sample.pdf	file-1762776540474-676505036.pdf	/uploads/file-1762776540474-676505036.pdf	18810	application/pdf	lead	2	1	2025-11-10 12:09:00.504	2025-11-10 12:09:00.504	\N
2	receipt-1	file-1762776888125-462329414.pdf	/uploads/file-1762776888125-462329414.pdf	18810	application/pdf	expense	1	1	2025-11-10 12:14:48.131	2025-11-10 12:14:48.131	\N
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.industries (id, name, slug, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: industry_fields; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.industry_fields (id, "industryId", name, key, type, "isRequired", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: integration_logs; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.integration_logs (id, "integrationId", operation, status, message, data, "errorDetails", "recordsCount", "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.invoice_items (id, "invoiceId", "productId", name, description, quantity, unit, "unitPrice", "taxRate", "discountRate", subtotal, "totalAmount", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.invoices (id, "invoiceNumber", title, description, status, subtotal, "taxAmount", "discountAmount", "totalAmount", "paidAmount", currency, "dueDate", notes, terms, "companyId", "leadId", "dealId", "quotationId", "createdBy", "sentAt", "viewedAt", "paidAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: lead_assignment_rules; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_assignment_rules (id, name, description, "isActive", conditions, actions, priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_communications; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_communications (id, "leadId", "userId", type, subject, content, direction, duration, outcome, "scheduledAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_followups; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_followups (id, "leadId", "userId", type, subject, notes, "scheduledAt", "completedAt", "isCompleted", "reminderSet", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_import_batches; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_import_batches (id, "fileName", "totalRows", "successRows", "failedRows", status, "errorDetails", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_import_records; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_import_records (id, "batchId", "rowIndex", "leadId", status, errors, "rawData", "createdAt") FROM stdin;
\.


--
-- Data for Name: lead_integration_sync; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_integration_sync (id, "leadId", "integrationId", "externalId", "externalData", "syncStatus", "lastSyncAt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lead_sources; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_sources (id, name, description, "isActive", "createdAt", "updatedAt", "companyId") FROM stdin;
\.


--
-- Data for Name: lead_tags; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.lead_tags (id, "leadId", "tagId") FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.leads (id, "firstName", "lastName", email, phone, company, "position", status, notes, "isActive", "createdAt", "updatedAt", "sourceId", "assignedTo", "companyId", "deletedAt", budget, currency, "lastContactedAt", "nextFollowUpAt", priority, industry, website, "companySize", "annualRevenue", "leadScore", address, country, state, city, "zipCode", "linkedinProfile", timezone, "preferredContactMethod", "convertedToDealId", "previousStatus") FROM stdin;
1	Mohit 	Shrivastava	Mohit.bellway@gmail.com	+91 9098466409	Bellway Infotech		CONVERTED	Looking For CRM	t	2025-11-09 08:18:48.574	2025-11-10 11:47:38.944	\N	1	\N	\N	100000.00	INR	\N	2025-11-10 08:20:00	HIGH		http://192.168.1.7:5173/leads/1/edit	100	1000000.00	\N	405b Anmol Space	India	MP 	Indore 	452001	linkedin.com	India	email	2	CONTACTED
2	Ankit	Sharma	Ankit@test.com	+91 9090909900	Bellway Infotech	CEO	QUALIFIED	He Is looking for CRM	t	2025-11-10 12:07:58.052	2025-11-10 18:34:55.801	\N	1	\N	\N	100000.00	INR	\N	2025-11-10 12:07:00	MEDIUM	IT	http://bellwayinfotech.com	100	1000000.00	\N	Gravity Mall 	India	Madhya Pradesh	Indore	452001	linkedin.com		email	\N	\N
3	Pratham 	Gwaswami	Pratham@gmail.com	+91 999999999	Bellway Infotech 	Dev	NEW	CRM	t	2025-11-11 09:45:53.605	2025-11-11 09:45:53.605	\N	1	\N	\N	10000.00	INR	\N	\N	MEDIUM	IT	Bellwayinfotech.com	1000	100000.00	\N	Test	India	MP	Indore	452001	linkedin.com		email	\N	\N
\.


--
-- Data for Name: login_sessions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.login_sessions (id, "userId", token, "deviceInfo", "ipAddress", "userAgent", "isActive", "expiresAt", "createdAt", "lastUsedAt") FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.notes (id, title, content, "isPinned", "leadId", "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Call 	Call Tomorrow he is busy	f	1	1	2025-11-09 08:21:44.907	2025-11-09 08:21:44.907	\N
2	Hi 	Looking for CRM	f	2	1	2025-11-10 12:08:16.662	2025-11-10 12:08:16.662	\N
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.notification_preferences (id, "userId", "inAppEnabled", "emailEnabled", "soundEnabled", preferences, "doNotDisturbStart", "doNotDisturbEnd", "createdAt", "updatedAt") FROM stdin;
1	1	t	f	t	{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}	\N	\N	2025-11-08 07:59:52.251	2025-11-08 07:59:52.251
2	3	t	f	t	{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}	\N	\N	2025-11-10 13:00:30.877	2025-11-10 13:00:30.877
3	5	t	f	t	{"taskDue": true, "clientReply": true, "followUpDue": true, "leadCreated": true, "leadUpdated": true, "leadAssigned": true, "paymentAdded": true, "taskAssigned": true, "paymentUpdated": true, "meetingScheduled": true}	\N	\N	2025-11-13 10:47:30.601	2025-11-13 10:47:30.601
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.notifications (id, "userId", type, title, message, link, read, "readAt", metadata, "createdAt", "updatedAt") FROM stdin;
3	1	LEAD_STATUS_CHANGED	Lead Status Changed	Lead "Mohit  Shrivastava" status changed to contacted	/leads/1	t	2025-11-09 10:20:23.355	{"leadId": 1, "leadName": "Mohit  Shrivastava"}	2025-11-09 08:25:22.595	2025-11-09 10:20:23.357
1	1	LEAD_ASSIGNED	Lead Assigned to You	You have been assigned to lead "Mohit  Shrivastava"	/leads/1	t	2025-11-10 11:55:55.576	{"leadId": 1, "leadName": "Mohit  Shrivastava"}	2025-11-09 08:21:06.349	2025-11-10 11:55:55.578
2	1	LEAD_STATUS_CHANGED	Lead Status Changed	Lead "Mohit  Shrivastava" status changed to contacted	/leads/1	t	2025-11-10 11:55:55.576	{"leadId": 1, "leadName": "Mohit  Shrivastava"}	2025-11-09 08:21:06.355	2025-11-10 11:55:55.578
4	1	LEAD_ASSIGNED	Lead Assigned to You	You have been assigned to lead "Ankit Sharma"	/leads/2	t	2025-11-10 13:49:29.223	{"leadId": 2, "leadName": "Ankit Sharma"}	2025-11-10 12:07:58.103	2025-11-10 13:49:29.224
5	1	LEAD_STATUS_CHANGED	Lead Status Changed	Lead "Ankit Sharma" status changed to qualified	/leads/2	f	\N	{"leadId": 2, "leadName": "Ankit Sharma"}	2025-11-10 18:34:55.852	2025-11-10 18:34:55.852
6	1	LEAD_ASSIGNED	Lead Assigned to You	You have been assigned to lead "Pratham  Gwaswami"	/leads/3	f	\N	{"leadId": 3, "leadName": "Pratham  Gwaswami"}	2025-11-11 09:45:53.651	2025-11-11 09:45:53.651
\.


--
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.password_history (id, "userId", password, "createdAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.payments (id, "invoiceId", amount, currency, "paymentMethod", "paymentDate", "referenceNumber", notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.permissions (id, name, key, description, module, "createdAt", "updatedAt") FROM stdin;
1	View Dashboard	dashboard.read	View dashboard	Dashboard	2025-11-08 05:53:29.962	2025-11-08 05:53:29.962
2	View Users	user.read	View users	Users	2025-11-08 05:53:29.963	2025-11-08 05:53:29.963
3	Create Users	user.create	Create users	Users	2025-11-08 05:53:29.964	2025-11-08 05:53:29.964
4	Update Users	user.update	Update users	Users	2025-11-08 05:53:29.965	2025-11-08 05:53:29.965
5	Delete Users	user.delete	Delete users	Users	2025-11-08 05:53:29.966	2025-11-08 05:53:29.966
6	View Leads	lead.read	View leads	Leads	2025-11-08 05:53:29.966	2025-11-08 05:53:29.966
7	Create Leads	lead.create	Create leads	Leads	2025-11-08 05:53:29.967	2025-11-08 05:53:29.967
8	Update Leads	lead.update	Update leads	Leads	2025-11-08 05:53:29.968	2025-11-08 05:53:29.968
9	Delete Leads	lead.delete	Delete leads	Leads	2025-11-08 05:53:29.968	2025-11-08 05:53:29.968
10	View Contacts	contact.read	View contacts	Contacts	2025-11-08 05:53:29.969	2025-11-08 05:53:29.969
11	Create Contacts	contact.create	Create contacts	Contacts	2025-11-08 05:53:29.97	2025-11-08 05:53:29.97
12	Update Contacts	contact.update	Update contacts	Contacts	2025-11-08 05:53:29.97	2025-11-08 05:53:29.97
13	Delete Contacts	contact.delete	Delete contacts	Contacts	2025-11-08 05:53:29.971	2025-11-08 05:53:29.971
14	View Deals	deal.read	View deals	Deals	2025-11-08 05:53:29.971	2025-11-08 05:53:29.971
15	Create Deals	deal.create	Create deals	Deals	2025-11-08 05:53:29.972	2025-11-08 05:53:29.972
16	Update Deals	deal.update	Update deals	Deals	2025-11-08 05:53:29.973	2025-11-08 05:53:29.973
17	Delete Deals	deal.delete	Delete deals	Deals	2025-11-08 05:53:29.973	2025-11-08 05:53:29.973
18	View Roles	role.read	View roles	Roles	2025-11-08 05:53:29.974	2025-11-08 05:53:29.974
19	Create Roles	role.create	Create roles	Roles	2025-11-08 05:53:29.974	2025-11-08 05:53:29.974
20	Update Roles	role.update	Update roles	Roles	2025-11-08 05:53:29.975	2025-11-08 05:53:29.975
21	Delete Roles	role.delete	Delete roles	Roles	2025-11-08 05:53:29.976	2025-11-08 05:53:29.976
22	Expense create	expense.create	Create expenses	Expenses	2025-11-08 05:53:29.976	2025-11-08 05:53:29.976
23	Expense read	expense.read	View expenses	Expenses	2025-11-08 05:53:29.977	2025-11-08 05:53:29.977
24	Expense update	expense.update	Edit expenses	Expenses	2025-11-08 05:53:29.977	2025-11-08 05:53:29.977
25	Expense delete	expense.delete	Delete expenses	Expenses	2025-11-08 05:53:29.978	2025-11-08 05:53:29.978
26	Expense approve	expense.approve	Approve/Reject expenses	Expenses	2025-11-08 05:53:29.978	2025-11-08 05:53:29.978
57	View Permissions	permission.read	View permissions	Permissions	2025-11-10 13:17:01.173	2025-11-10 13:17:01.173
58	Create Permissions	permission.create	Create permissions	Permissions	2025-11-10 13:17:01.177	2025-11-10 13:17:01.177
59	Update Permissions	permission.update	Update permissions	Permissions	2025-11-10 13:17:01.181	2025-11-10 13:17:01.181
60	Delete Permissions	permission.delete	Delete permissions	Permissions	2025-11-10 13:17:01.183	2025-11-10 13:17:01.183
61	View Quotations	quotation.read	View quotations	Quotations	2025-11-10 13:17:01.192	2025-11-10 13:17:01.192
62	Create Quotations	quotation.create	Create quotations	Quotations	2025-11-10 13:17:01.193	2025-11-10 13:17:01.193
63	Update Quotations	quotation.update	Update quotations	Quotations	2025-11-10 13:17:01.194	2025-11-10 13:17:01.194
64	Delete Quotations	quotation.delete	Delete quotations	Quotations	2025-11-10 13:17:01.194	2025-11-10 13:17:01.194
65	View Invoices	invoice.read	View invoices	Invoices	2025-11-10 13:17:01.195	2025-11-10 13:17:01.195
66	Create Invoices	invoice.create	Create invoices	Invoices	2025-11-10 13:17:01.196	2025-11-10 13:17:01.196
67	Update Invoices	invoice.update	Update invoices	Invoices	2025-11-10 13:17:01.197	2025-11-10 13:17:01.197
68	Delete Invoices	invoice.delete	Delete invoices	Invoices	2025-11-10 13:17:01.2	2025-11-10 13:17:01.2
69	View Activities	activity.read	View tasks and activities	Activities	2025-11-10 13:17:01.2	2025-11-10 13:17:01.2
70	View Business Settings	business_settings.read	View business settings	BusinessSettings	2025-11-10 13:17:01.201	2025-11-10 13:17:01.201
71	Update Business Settings	business_settings.update	Update business settings	BusinessSettings	2025-11-10 13:17:01.202	2025-11-10 13:17:01.202
72	View Trash	deleted.read	View deleted items	Trash	2025-11-10 13:17:01.202	2025-11-10 13:17:01.202
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.products (id, name, description, sku, type, category, price, cost, currency, unit, "taxRate", "isActive", "stockQuantity", "minStockLevel", "maxStockLevel", image, "companyId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: proposal_templates; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.proposal_templates (id, name, description, content, "isActive", "isDefault", "headerHtml", "footerHtml", styles, variables, "previewImage", category, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.quotation_items (id, "quotationId", "productId", name, description, quantity, unit, "unitPrice", "taxRate", "discountRate", subtotal, "totalAmount", "sortOrder", "createdAt", "updatedAt") FROM stdin;
1	1	\N			1.00	Unit	100.00	10.00	0.00	100.00	110.00	0	2025-11-09 09:04:25.443	2025-11-09 09:04:25.443
2	2	\N			1.00	Unit	10000.00	0.00	0.00	10000.00	10000.00	0	2025-11-10 12:09:41.639	2025-11-10 12:09:41.639
\.


--
-- Data for Name: quotation_templates; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.quotation_templates (id, name, description, "headerContent", "footerContent", "termsAndConditions", "validityDays", "showTax", "showDiscount", "logoPosition", "isDefault", "isActive", styles, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.quotations (id, "quotationNumber", title, description, status, subtotal, "taxAmount", "discountAmount", "totalAmount", currency, "validUntil", notes, terms, "companyId", "leadId", "dealId", "createdBy", "sentAt", "viewedAt", "acceptedAt", "rejectedAt", "expiresAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Q-000001	Proposal for Mohit  Shrivastava	\N	SENT	100.00	10.00	0.00	110.00	INR	\N	\N		\N	1	\N	1	\N	\N	\N	\N	\N	2025-11-09 09:04:25.443	2025-11-09 09:04:25.47	\N
2	Q-000002	Proposal for Ankit Sharma	\N	SENT	10000.00	0.00	0.00	10000.00	INR	\N	\N		\N	2	\N	1	\N	\N	\N	\N	\N	2025-11-10 12:09:41.639	2025-11-10 12:09:41.658	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "isRevoked", "createdAt") FROM stdin;
1	$2a$10$Y6OgcOaMs8fmLUDSd2QVMewgzZgCpTfcXesWnZMZP/Q3NNRqFoHTq	1	2025-11-15 05:58:15.037	f	2025-11-08 05:58:15.037
2	$2a$10$uY8CxR0nVnEWjstLqOJOFegEwTrIaHQsKvWhQhnA63qooAxwZmdJy	1	2025-11-15 06:04:51.677	f	2025-11-08 06:04:51.678
3	$2a$10$JWWvFM1gYeaa3hAfZkm2F.evAZbVekzpFoP8rNiEZlgmCzTcyK.ei	1	2025-11-16 07:54:55.52	f	2025-11-09 07:54:55.522
4	$2a$10$fn2uLkfbR9Zs5Kawjf7ETe7fFNASPmlyLhtX4bGEWhMsQnYJbd/CS	1	2025-11-16 08:01:05.905	f	2025-11-09 08:01:05.907
5	$2a$10$A2hmHp1SAl4qZDnE6zMrWOldwOXhSJu1k4JIAP7ynNxxjc5Vh.q4u	1	2025-11-16 08:02:49.347	f	2025-11-09 08:02:49.348
6	$2a$10$p4rlk.OPPG82HDmPAk9.wee2Vw3WI9zhzYi.EubYXwzPbYHUNLV4i	1	2025-11-16 08:02:54.893	f	2025-11-09 08:02:54.894
7	$2a$10$ygT7IcsbcZU888Y.u8Z48OWKlP2A7cq3e/VhQkCvZ.wm.4SleOPO.	1	2025-11-16 08:03:20.618	f	2025-11-09 08:03:20.619
8	$2a$10$WRfAfTI/BJt4avmr.wylvOJ38N05ltj5ahNil6coC0LbbcsD7BaSC	1	2025-11-16 08:03:23.161	f	2025-11-09 08:03:23.162
9	$2a$10$xxSY/Acfzl.Xe7k63n9fDee73faFhcfQn33qIZ5FadwtWKYX9Pjqm	1	2025-11-16 08:04:20.545	f	2025-11-09 08:04:20.546
10	$2a$10$NRG4hX0sWUXSilco4TswMeWk9QntTeMip/9fNeaUQkxYIjYGIKY6y	1	2025-11-16 08:05:51.254	f	2025-11-09 08:05:51.255
11	$2a$10$IR3AyB.ZBAVq68jSOjIlt.C4NaBh0BlrXxFRfuU4/MkxZk3F4soda	1	2025-11-16 08:06:31.796	f	2025-11-09 08:06:31.797
12	$2a$10$11.L6k8fGntzNcVinihJK.9C01cnvDl6yhvrOXylbBou7lRe2hsCa	1	2025-11-16 08:06:34.277	f	2025-11-09 08:06:34.278
13	$2a$10$d/JWuGsT88LrEb.h/NghV.4X7g2Yd1AcZ4zwZtYDRTkcGBnrn38ru	1	2025-11-17 11:47:02.676	f	2025-11-10 11:47:02.678
14	$2a$10$Wd9mVUrQQbFETjmNfxFeGeWgsH.FxrWTTpbvrgdWBzKQSODeIzRji	3	2025-11-17 13:00:30.779	f	2025-11-10 13:00:30.78
15	$2a$10$ps7TLLDOJvjUhy/bUuRZQuduaAb3l1wUXfyf.4skakdhwYen.RJjG	1	2025-11-17 17:18:03.075	f	2025-11-10 17:18:03.076
16	$2a$10$M99BrfZbagNhM9WSS2s9fOtMTq6BQD1/kJ/FKjSinBiQblcJ9.rvC	1	2025-11-18 09:16:58.49	f	2025-11-11 09:16:58.492
17	$2a$10$A6s99SitAtRbeKjk4vk7HuitI4wLKIReR4Eb41eFAoM.aKTyeWX6i	1	2025-11-18 09:17:08.938	f	2025-11-11 09:17:08.939
18	$2a$10$DjkKh0Pkn5r3G5IIFovNY.vsMF.tB5qXsjIPsVspNpEMpmF4XFn9O	3	2025-11-18 09:17:22.754	f	2025-11-11 09:17:22.754
19	$2a$10$GgPUCX8WbQGWaKebadFMBeI5lLXjdFw3lG9OYxXlY5lIXJH.rFcRe	1	2025-11-18 09:17:42.32	f	2025-11-11 09:17:42.32
20	$2a$10$yu6aTGk5JXs/iSncRHic2eKoDCBKCH7bW7pHw.I6UiK5QgWinC9ay	1	2025-11-18 09:29:33.459	f	2025-11-11 09:29:33.46
21	$2a$10$vRYwDYy1YWfGOhY7Uh14f.lVlrbftjutobsmKD3QbBmVxu0NunGpG	1	2025-11-18 12:32:37.76	f	2025-11-11 12:32:37.762
22	$2a$10$ARfHLhAvf9dJNWTrgRL5xuTFVNcl7Ryn8QSTQeDO8pktWec5bw2cO	1	2025-11-20 10:37:50.744	f	2025-11-13 10:37:50.745
23	$2a$10$OLbxJAMR18xJqY9CIQ96kO6P4i4xxSeKHzcDFicZSmFQw1Quw41HS	5	2025-11-20 10:47:30.478	f	2025-11-13 10:47:30.479
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.role_permissions (id, "roleId", "permissionId") FROM stdin;
1	1	22
2	1	23
3	1	24
4	1	25
5	1	26
6	1	1
7	1	2
8	1	3
9	1	4
10	1	5
11	1	6
12	1	7
13	1	8
14	1	9
15	1	10
16	1	11
17	1	12
18	1	13
19	1	14
20	1	15
21	1	16
22	1	17
23	1	18
24	1	19
25	1	20
26	1	21
27	2	10
28	2	24
29	2	15
30	2	14
31	2	1
32	3	1
33	3	6
34	3	7
35	3	8
36	3	14
37	3	15
38	3	16
39	3	61
40	3	62
41	3	63
42	3	65
43	3	69
44	4	1
45	4	6
46	4	7
47	4	8
48	4	9
49	4	14
50	4	15
51	4	16
52	4	17
53	4	61
54	4	62
55	4	63
56	4	64
57	4	65
58	4	67
59	4	68
60	4	69
61	1	57
62	1	58
63	1	59
64	1	60
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.roles (id, name, description, "isActive", "createdAt", "updatedAt", "deletedAt", "accessScope") FROM stdin;
1	Admin	Administrator role with full access	t	2025-11-08 05:53:29.889	2025-11-08 05:53:29.889	\N	GLOBAL
2	VIew		t	2025-11-10 13:15:43.654	2025-11-10 13:15:43.654	\N	GLOBAL
3	Sales Executive	Can manage own leads/deals and view activities	t	2025-11-10 13:17:01.205	2025-11-10 13:17:01.205	\N	OWN
4	Sales Manager	Manage team leads/deals and quotations, view activities	t	2025-11-10 13:17:01.207	2025-11-10 13:17:01.207	\N	GLOBAL
\.


--
-- Data for Name: super_admin_permissions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.super_admin_permissions (id, name, key, description, module, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: super_admin_role_assignments; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.super_admin_role_assignments (id, "superAdminId", "roleId") FROM stdin;
\.


--
-- Data for Name: super_admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.super_admin_role_permissions (id, "roleId", "permissionId") FROM stdin;
\.


--
-- Data for Name: super_admin_roles; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.super_admin_roles (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: super_admins; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.super_admins (id, email, password, "firstName", "lastName", "isActive", "lastLogin", "createdAt", "updatedAt", "profilePicture") FROM stdin;
1	admin@weconnect.com	$2a$10$ZWPMK3Jja77QK8DXNzBH0uSEMqLF6YGxip9Y3YdeD4/DP2GWjHt/K	Super	Admin	t	\N	2025-11-08 05:53:29.817	2025-11-08 05:53:29.817	\N
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.tags (id, name, color, description, "isActive", "createdAt", "updatedAt", "companyId") FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.tasks (id, title, description, status, priority, "dueDate", "completedAt", "assignedTo", "createdBy", "leadId", "dealId", "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: third_party_integrations; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.third_party_integrations (id, name, "displayName", description, "isActive", "apiEndpoint", "authType", config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.user_roles (id, "userId", "roleId") FROM stdin;
1	1	1
4	2	1
5	3	2
6	4	3
8	5	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.users (id, email, password, "firstName", "lastName", "isActive", "lastLogin", "createdAt", "updatedAt", "profilePicture", "companyId", "deletedAt", "accountLockedUntil", "emailVerificationToken", "emailVerified", "emailVerifiedAt", "failedLoginAttempts", "passwordResetExpires", "passwordResetToken", "twoFactorEnabled", "twoFactorSecret", "managerId", "dateOfBirth") FROM stdin;
2	test@weconnect.com	$2a$10$sg482s508lMYET91VY58L.D0/1d8u8tj./6rVZKufeJoMbK33xf/q	Test	User	t	\N	2025-11-08 05:53:29.959	2025-11-10 12:58:57.186	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N
4	sales.exec@weconnect.com	$2a$10$lGxbfvMzeJKcTRmZlAuDReaOeYCh/1m/LYAMDuSIsczPoxDemJqfi	Sales	Executive	t	\N	2025-11-10 13:17:01.307	2025-11-10 13:17:01.307	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N
3	Ankit.sharma@gmail.com	$2a$10$u5KaVo4QHxL0JEi3WZ1o3Oxu1NrkNkozCRH/vo3RDMKxZ2RGLr3NS	Ankit	Sharma 	t	2025-11-11 09:17:22.756	2025-11-10 12:53:48.184	2025-11-11 09:17:22.756	\N	\N	\N	\N	\N	f	\N	0	\N	\N	f	\N	\N	\N
1	admin@weconnect.com	$2a$10$QWm00iyi87NH5yztyVxi0e6ncRrPXy7JERLsFY/nOQGIPqJ3ltMDS	Admin	User	t	2025-11-13 10:37:50.756	2025-11-08 05:53:29.887	2025-11-13 10:37:50.757	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	\N	\N
5	sales.manager@weconnect.com	$2a$10$jKmMY9BGn8AT9y6uHDLY9eCIGMBMZKrAZYhHMdo7mynrE0hqjwiNK	Sales	Manager	t	2025-11-13 10:47:30.482	2025-11-10 13:17:01.384	2025-11-13 10:47:30.483	\N	\N	\N	\N	\N	t	\N	0	\N	\N	f	\N	3	\N
\.


--
-- Data for Name: workflow_executions; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.workflow_executions (id, "workflowId", "triggerData", status, result, error, "startedAt", "completedAt", duration) FROM stdin;
1	1	{"id": 3, "city": "Indore", "tags": [], "email": "Pratham@gmail.com", "notes": "CRM", "phone": "+91 999999999", "state": "MP", "budget": 10000, "source": null, "status": "new", "address": "Test", "company": "Bellway Infotech ", "country": "India", "website": "Bellwayinfotech.com", "zipCode": "452001", "currency": "INR", "industry": "IT", "isActive": true, "lastName": "Gwaswami", "position": "Dev", "priority": "medium", "sourceId": null, "timezone": "", "companyId": null, "createdAt": "2025-11-11T09:45:53.605Z", "deletedAt": null, "firstName": "Pratham ", "leadScore": null, "updatedAt": "2025-11-11T09:45:53.605Z", "assignedTo": 1, "companySize": 1000, "annualRevenue": 100000, "nextFollowUpAt": null, "previousStatus": null, "lastContactedAt": null, "linkedinProfile": "linkedin.com", "convertedToDealId": null, "preferredContactMethod": "email"}	SKIPPED	{"reason": "Conditions not met"}	\N	2025-11-11 09:45:53.631	2025-11-11 09:45:53.636	10
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: weconnect_user
--

COPY public.workflows (id, name, description, "isActive", trigger, "triggerData", conditions, actions, "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	New Lead assign	Test	t	LEAD_CREATED	{}	{"logic": "AND", "conditions": [{"field": "status", "value": "New", "operator": "EQUALS"}]}	[{"type": "ASSIGN_TO_TEAM", "config": {}}]	1	2025-11-11 09:43:39.848	2025-11-11 09:49:11.13	2025-11-11 09:49:11.129
2	Lead 	Hi 	t	LEAD_CREATED	{}	{"logic": "AND", "conditions": [{"field": "city", "value": "Indore", "operator": "EQUALS"}]}	[{"type": "ASSIGN_TO_USER", "config": {}}]	1	2025-11-11 09:49:55.539	2025-11-11 09:49:55.539	\N
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.activities_id_seq', 10, true);


--
-- Name: budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.budgets_id_seq', 1, false);


--
-- Name: business_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.business_settings_id_seq', 1, true);


--
-- Name: call_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.call_logs_id_seq', 1, false);


--
-- Name: communication_automations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.communication_automations_id_seq', 1, false);


--
-- Name: communication_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.communication_messages_id_seq', 1, false);


--
-- Name: communication_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.communication_providers_id_seq', 1, false);


--
-- Name: communication_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.communication_templates_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, false);


--
-- Name: company_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.company_activities_id_seq', 1, false);


--
-- Name: company_communications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.company_communications_id_seq', 1, false);


--
-- Name: company_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.company_followups_id_seq', 1, false);


--
-- Name: deal_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.deal_products_id_seq', 1, false);


--
-- Name: deals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.deals_id_seq', 2, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.files_id_seq', 2, true);


--
-- Name: industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.industries_id_seq', 1, false);


--
-- Name: industry_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.industry_fields_id_seq', 1, false);


--
-- Name: integration_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.integration_logs_id_seq', 1, false);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: lead_assignment_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_assignment_rules_id_seq', 1, false);


--
-- Name: lead_communications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_communications_id_seq', 1, false);


--
-- Name: lead_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_followups_id_seq', 1, false);


--
-- Name: lead_import_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_import_batches_id_seq', 1, false);


--
-- Name: lead_import_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_import_records_id_seq', 1, false);


--
-- Name: lead_integration_sync_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_integration_sync_id_seq', 1, false);


--
-- Name: lead_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_sources_id_seq', 1, false);


--
-- Name: lead_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.lead_tags_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.leads_id_seq', 3, true);


--
-- Name: login_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.login_sessions_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.notes_id_seq', 2, true);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 6, true);


--
-- Name: password_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.password_history_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.permissions_id_seq', 82, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: proposal_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.proposal_templates_id_seq', 1, false);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 2, true);


--
-- Name: quotation_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.quotation_templates_id_seq', 1, false);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.quotations_id_seq', 2, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 23, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 64, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: super_admin_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.super_admin_permissions_id_seq', 1, false);


--
-- Name: super_admin_role_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.super_admin_role_assignments_id_seq', 1, false);


--
-- Name: super_admin_role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.super_admin_role_permissions_id_seq', 1, false);


--
-- Name: super_admin_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.super_admin_roles_id_seq', 1, false);


--
-- Name: super_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.super_admins_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: third_party_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.third_party_integrations_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: workflow_executions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.workflow_executions_id_seq', 1, true);


--
-- Name: workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: weconnect_user
--

SELECT pg_catalog.setval('public.workflows_id_seq', 2, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: call_logs call_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT call_logs_pkey PRIMARY KEY (id);


--
-- Name: communication_automations communication_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT communication_automations_pkey PRIMARY KEY (id);


--
-- Name: communication_messages communication_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT communication_messages_pkey PRIMARY KEY (id);


--
-- Name: communication_providers communication_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_providers
    ADD CONSTRAINT communication_providers_pkey PRIMARY KEY (id);


--
-- Name: communication_templates communication_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT communication_templates_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_activities company_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT company_activities_pkey PRIMARY KEY (id);


--
-- Name: company_communications company_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT company_communications_pkey PRIMARY KEY (id);


--
-- Name: company_followups company_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT company_followups_pkey PRIMARY KEY (id);


--
-- Name: deal_products deal_products_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deal_products
    ADD CONSTRAINT deal_products_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: industry_fields industry_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.industry_fields
    ADD CONSTRAINT industry_fields_pkey PRIMARY KEY (id);


--
-- Name: integration_logs integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT integration_logs_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lead_assignment_rules lead_assignment_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_assignment_rules
    ADD CONSTRAINT lead_assignment_rules_pkey PRIMARY KEY (id);


--
-- Name: lead_communications lead_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT lead_communications_pkey PRIMARY KEY (id);


--
-- Name: lead_followups lead_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT lead_followups_pkey PRIMARY KEY (id);


--
-- Name: lead_import_batches lead_import_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_batches
    ADD CONSTRAINT lead_import_batches_pkey PRIMARY KEY (id);


--
-- Name: lead_import_records lead_import_records_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT lead_import_records_pkey PRIMARY KEY (id);


--
-- Name: lead_integration_sync lead_integration_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT lead_integration_sync_pkey PRIMARY KEY (id);


--
-- Name: lead_sources lead_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT lead_sources_pkey PRIMARY KEY (id);


--
-- Name: lead_tags lead_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT lead_tags_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: login_sessions login_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT login_sessions_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_history password_history_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT password_history_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: proposal_templates proposal_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.proposal_templates
    ADD CONSTRAINT proposal_templates_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotation_templates quotation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_templates
    ADD CONSTRAINT quotation_templates_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: super_admin_permissions super_admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_permissions
    ADD CONSTRAINT super_admin_permissions_pkey PRIMARY KEY (id);


--
-- Name: super_admin_role_assignments super_admin_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT super_admin_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: super_admin_role_permissions super_admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT super_admin_role_permissions_pkey PRIMARY KEY (id);


--
-- Name: super_admin_roles super_admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_roles
    ADD CONSTRAINT super_admin_roles_pkey PRIMARY KEY (id);


--
-- Name: super_admins super_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admins
    ADD CONSTRAINT super_admins_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: third_party_integrations third_party_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.third_party_integrations
    ADD CONSTRAINT third_party_integrations_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: companies_domain_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX companies_domain_key ON public.companies USING btree (domain);


--
-- Name: companies_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX companies_name_key ON public.companies USING btree (name);


--
-- Name: companies_slug_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);


--
-- Name: industries_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX industries_name_key ON public.industries USING btree (name);


--
-- Name: industries_slug_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX industries_slug_key ON public.industries USING btree (slug);


--
-- Name: industry_fields_industryId_key_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "industry_fields_industryId_key_key" ON public.industry_fields USING btree ("industryId", key);


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: lead_integration_sync_externalId_integrationId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "lead_integration_sync_externalId_integrationId_key" ON public.lead_integration_sync USING btree ("externalId", "integrationId");


--
-- Name: lead_integration_sync_leadId_integrationId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "lead_integration_sync_leadId_integrationId_key" ON public.lead_integration_sync USING btree ("leadId", "integrationId");


--
-- Name: lead_sources_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX lead_sources_name_key ON public.lead_sources USING btree (name);


--
-- Name: lead_tags_leadId_tagId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "lead_tags_leadId_tagId_key" ON public.lead_tags USING btree ("leadId", "tagId");


--
-- Name: login_sessions_token_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX login_sessions_token_key ON public.login_sessions USING btree (token);


--
-- Name: notification_preferences_userId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "notification_preferences_userId_key" ON public.notification_preferences USING btree ("userId");


--
-- Name: notifications_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE INDEX "notifications_userId_createdAt_idx" ON public.notifications USING btree ("userId", "createdAt");


--
-- Name: notifications_userId_read_idx; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE INDEX "notifications_userId_read_idx" ON public.notifications USING btree ("userId", read);


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: quotations_quotationNumber_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "quotations_quotationNumber_key" ON public.quotations USING btree ("quotationNumber");


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: super_admin_permissions_key_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX super_admin_permissions_key_key ON public.super_admin_permissions USING btree (key);


--
-- Name: super_admin_role_assignments_superAdminId_roleId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "super_admin_role_assignments_superAdminId_roleId_key" ON public.super_admin_role_assignments USING btree ("superAdminId", "roleId");


--
-- Name: super_admin_role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "super_admin_role_permissions_roleId_permissionId_key" ON public.super_admin_role_permissions USING btree ("roleId", "permissionId");


--
-- Name: super_admin_roles_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX super_admin_roles_name_key ON public.super_admin_roles USING btree (name);


--
-- Name: super_admins_email_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX super_admins_email_key ON public.super_admins USING btree (email);


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: third_party_integrations_name_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX third_party_integrations_name_key ON public.third_party_integrations USING btree (name);


--
-- Name: user_roles_userId_roleId_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON public.user_roles USING btree ("userId", "roleId");


--
-- Name: users_emailVerificationToken_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON public.users USING btree ("emailVerificationToken");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_passwordResetToken_key; Type: INDEX; Schema: public; Owner: weconnect_user
--

CREATE UNIQUE INDEX "users_passwordResetToken_key" ON public.users USING btree ("passwordResetToken");


--
-- Name: activities activities_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_superAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES public.super_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: budgets budgets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: call_logs call_logs_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT "call_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: call_logs call_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.call_logs
    ADD CONSTRAINT "call_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_automations communication_automations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_automations communication_automations_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_automations communication_automations_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_automations
    ADD CONSTRAINT "communication_automations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.communication_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: communication_messages communication_messages_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: communication_messages communication_messages_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.communication_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_messages communication_messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_messages
    ADD CONSTRAINT "communication_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: communication_providers communication_providers_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_providers
    ADD CONSTRAINT "communication_providers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_templates communication_templates_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT "communication_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: communication_templates communication_templates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.communication_templates
    ADD CONSTRAINT "communication_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: companies companies_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public.industries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: companies companies_parentCompanyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_activities company_activities_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT "company_activities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_activities company_activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_activities
    ADD CONSTRAINT "company_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_communications company_communications_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT "company_communications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_communications company_communications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_communications
    ADD CONSTRAINT "company_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: company_followups company_followups_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT "company_followups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_followups company_followups_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.company_followups
    ADD CONSTRAINT "company_followups_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deal_products deal_products_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deal_products
    ADD CONSTRAINT "deal_products_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deals deals_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deals deals_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deals deals_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_rejectedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expenses expenses_submittedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: files files_uploadedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: industry_fields industry_fields_industryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.industry_fields
    ADD CONSTRAINT "industry_fields_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES public.industries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: integration_logs integration_logs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT "integration_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public.third_party_integrations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_communications lead_communications_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT "lead_communications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_communications lead_communications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_communications
    ADD CONSTRAINT "lead_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_followups lead_followups_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT "lead_followups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_followups lead_followups_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_followups
    ADD CONSTRAINT "lead_followups_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_import_batches lead_import_batches_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_batches
    ADD CONSTRAINT "lead_import_batches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_import_records lead_import_records_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT "lead_import_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public.lead_import_batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_import_records lead_import_records_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_import_records
    ADD CONSTRAINT "lead_import_records_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_integration_sync lead_integration_sync_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT "lead_integration_sync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public.third_party_integrations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_integration_sync lead_integration_sync_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_integration_sync
    ADD CONSTRAINT "lead_integration_sync_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_sources lead_sources_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_sources
    ADD CONSTRAINT "lead_sources_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lead_tags lead_tags_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT "lead_tags_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_tags lead_tags_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.lead_tags
    ADD CONSTRAINT "lead_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leads leads_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public.lead_sources(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: login_sessions login_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notes notes_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "notes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notes notes_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_history password_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotation_items quotation_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "quotation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotation_items quotation_items_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_assignments super_admin_role_assignments_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT "super_admin_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.super_admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_assignments super_admin_role_assignments_superAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_assignments
    ADD CONSTRAINT "super_admin_role_assignments_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES public.super_admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_permissions super_admin_role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT "super_admin_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.super_admin_permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: super_admin_role_permissions super_admin_role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.super_admin_role_permissions
    ADD CONSTRAINT "super_admin_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.super_admin_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tags tags_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT "tags_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_executions workflow_executions_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: weconnect_user
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public.workflows(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict uBUNOh9Net9873LIOMQvnNdTp3OWKAm1apE0Vu9wl1EsxaSzUeYe8FMfIrESkjm

