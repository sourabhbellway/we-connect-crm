export interface Company {
  id: number;
  name: string;
  domain?: string;
  website?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  description?: string;
  employeeCount?: string; // e.g., "1-10", "11-50", "51-200", etc.
  annualRevenue?: number;
  currency?: string;
  foundedYear?: number;
  linkedinProfile?: string;
  twitterHandle?: string;
  facebookPage?: string;
  tags: string[];
  notes?: string;
  companySize: CompanySize;
  status: CompanyStatus;
  parentCompanyId?: number;
  assignedTo?: number;
  leadScore?: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  timezone?: string;
  isActive: boolean;
  slug?: string;
  industryId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Relationships
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  industry?: {
    id: number;
    name: string;
    slug?: string;
  };
  parentCompany?: {
    id: number;
    name: string;
  };
  subsidiaries?: {
    id: number;
    name: string;
    status: CompanyStatus;
  }[];
  contacts?: Contact[];
  deals?: Deal[];
  leads?: Lead[];
  activities?: CompanyActivity[];
  communications?: CompanyCommunication[];
  followUps?: CompanyFollowUp[];

  // Statistics (calculated fields)
  totalRevenue?: number;
  wonDealsCount?: number;
  dealStatsByStatus?: Record<string, { count: number; value: number }>;
  _count?: {
    contacts: number;
    deals: number;
    leads: number;
    subsidiaries: number;
  };
}

export interface CompanyActivity {
  id: number;
  companyId: number;
  userId?: number;
  type: CompanyActivityType;
  title: string;
  description?: string;
  duration?: number; // Duration in minutes
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CompanyCommunication {
  id: number;
  companyId: number;
  userId: number;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: string;
  status: MessageStatus;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CompanyFollowUp {
  id: number;
  companyId: number;
  userId: number;
  type: CommunicationType;
  subject: string;
  notes?: string;
  priority: TaskPriority;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  reminderSet: boolean;
  createdAt: string;
  updatedAt: string;
  
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  companiesWithDeals: number;
  totalRevenue: number;
  companiesThisMonth: number;
  companiesBySize: Record<string, number>;
  companiesByStatus: Record<string, number>;
  topCompaniesByRevenue: Array<{
    id: number;
    name: string;
    total_revenue: number;
  }>;
}

// Enums
export enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE"
}

export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PROSPECT = "PROSPECT",
  CUSTOMER = "CUSTOMER",
  PARTNER = "PARTNER",
  COMPETITOR = "COMPETITOR"
}

export enum CompanyActivityType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  MEETING = "MEETING",
  VISIT = "VISIT",
  DEMO = "DEMO",
  PRESENTATION = "PRESENTATION",
  FOLLOW_UP = "FOLLOW_UP",
  NOTE = "NOTE",
  QUOTE_SENT = "QUOTE_SENT",
  CONTRACT_SENT = "CONTRACT_SENT",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  SUPPORT_TICKET = "SUPPORT_TICKET",
  TRAINING = "TRAINING",
  AUDIT = "AUDIT",
  REVIEW = "REVIEW",
  PARTNERSHIP = "PARTNERSHIP",
  OTHER = "OTHER"
}

export enum CommunicationType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  SMS = "SMS",
  MEETING = "MEETING",
  NOTE = "NOTE"
}

export enum MessageStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

// Shared types from other modules
interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  lastContactedAt?: string;
}

interface Deal {
  id: number;
  title: string;
  value?: number;
  currency: string;
  status: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
}