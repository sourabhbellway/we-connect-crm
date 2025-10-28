export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  company?: string; // Legacy field
  position?: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedinProfile?: string;
  twitterHandle?: string;
  notes?: string;
  tags: string[];
  assignedTo?: number;
  companyId?: number;
  sourceLeadId?: number;
  leadScore?: number;
  lastContactedAt?: string;
  preferredContactMethod?: string;
  timezone?: string;
  birthday?: string;
  industry?: string;
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
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
  companyRelation?: {
    id: number;
    name: string;
  };
  sourceLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  deals?: Deal[];
  tasks?: Task[];
  activities?: ContactActivity[];
  communications?: ContactCommunication[];
  followUps?: ContactFollowUp[];
}

export interface ContactActivity {
  id: number;
  contactId: number;
  userId?: number;
  type: ContactActivityType;
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

export interface ContactCommunication {
  id: number;
  contactId: number;
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

export interface ContactFollowUp {
  id: number;
  contactId: number;
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

export interface ContactStats {
  totalContacts: number;
  contactsWithDeals: number;
  activeDealsValue: number;
  contactsThisMonth: number;
}

// Enums
export enum ContactActivityType {
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

// Import shared types
interface Deal {
  id: number;
  title: string;
  value?: number;
  currency: string;
  status: string;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
}