// Business Settings Types

export interface CompanySettings {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
  gstNumber: string;
  panNumber?: string;
  cinNumber?: string;
  timezone: string;
  fiscalYearStart: string; // MM-DD format
  industry?: string;
  employeeCount?: string;
  description?: string;
  invoiceTemplate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencySettings {
  id?: string;
  primary: string;
  symbol: string;
  position: 'before' | 'after'; // $100 or 100$
  decimalPlaces: number;
  thousandSeparator: ',' | '.';
  decimalSeparator: '.' | ',';
  supportedCurrencies: string[];
  exchangeRates?: Record<string, number>;
  autoUpdateRates: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxSettings {
  id?: string;
  defaultRate: number;
  type: 'GST' | 'VAT' | 'SALES_TAX' | 'CUSTOM';
  inclusive: boolean; // Tax included in price or added on top
  customRates: TaxRate[];
  registrationNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxRate {
  id?: string;
  name: string;
  rate: number;
  description?: string;
  isActive: boolean;
}

export interface LeadSource {
  id?: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  costPerLead?: number;
  conversionRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadStatus {
  id?: string;
  name: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealStatus {
  id?: string;
  name: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id?: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceList {
  id?: string;
  name: string;
  description?: string;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableRoles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'followup' | 'proposal' | 'invoice' | 'reminder' | 'custom';
  variables: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationTemplate {
  id?: string;
  name: string;
  headerContent: string;
  footerContent: string;
  termsAndConditions: string;
  validityDays: number;
  showTax: boolean;
  showDiscount: boolean;
  logoPosition: 'left' | 'right' | 'center';
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceTemplate {
  id?: string;
  name: string;
  headerContent: string;
  footerContent: string;
  termsAndConditions: string;
  paymentTerms: string;
  dueDays: number;
  showTax: boolean;
  showDiscount: boolean;
  logoPosition: 'left' | 'right' | 'center';
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationSettings {
  id?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  leadNotifications: NotificationPreference;
  dealNotifications: NotificationPreference;
  taskNotifications: NotificationPreference;
  paymentNotifications: NotificationPreference;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPreference {
  newItem: boolean;
  statusChange: boolean;
  assignment: boolean;
  reminder: boolean;
  overdue: boolean;
  channels: ('email' | 'sms' | 'whatsapp' | 'push' | 'in_app')[];
}

export interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationTrigger {
  type: 'lead_created' | 'deal_stage_changed' | 'task_overdue' | 'payment_received' | 'custom';
  event: string;
  delay?: number; // in minutes
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'create_task' | 'assign_user' | 'change_status' | 'webhook' | 'custom';
  parameters: Record<string, any>;
}

export interface IntegrationSettings {
  id?: string;
  whatsapp: WhatsAppIntegration;
  sms: SMSIntegration;
  email: EmailIntegration;
  zapier: ZapierIntegration;
  customWebhooks: WebhookIntegration[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppIntegration {
  enabled: boolean;
  apiKey?: string;
  phoneNumber?: string;
  businessAccountId?: string;
  webhookUrl?: string;
  templates: WhatsAppTemplate[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface SMSIntegration {
  enabled: boolean;
  provider: 'twilio' | 'aws_sns' | 'custom';
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
  templates: SMSTemplate[];
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  type: 'welcome' | 'otp' | 'reminder' | 'marketing';
}

export interface EmailIntegration {
  enabled: boolean;
  provider: 'smtp' | 'sendgrid' | 'aws_ses' | 'mailgun';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface ZapierIntegration {
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  triggers: string[];
}

export interface WebhookIntegration {
  id?: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'GET';
  headers: Record<string, string>;
  events: string[];
  isActive: boolean;
  secretKey?: string;
}

export interface PaymentGatewaySettings {
  id?: string;
  stripe: StripeSettings;
  paypal: PayPalSettings;
  razorpay: RazorpaySettings;
  custom: CustomPaymentGateway[];
  defaultGateway: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StripeSettings {
  enabled: boolean;
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  currency: string;
  captureMethod: 'automatic' | 'manual';
}

export interface PayPalSettings {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  mode: 'sandbox' | 'live';
  currency: string;
}

export interface RazorpaySettings {
  enabled: boolean;
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  currency: string;
}

export interface CustomPaymentGateway {
  id?: string;
  name: string;
  apiUrl: string;
  apiKey?: string;
  secretKey?: string;
  supportedCurrencies: string[];
  isActive: boolean;
}

// Combined Business Settings Interface
export interface BusinessSettings {
  company: CompanySettings;
  currency: CurrencySettings;
  tax: TaxSettings;
  leadSources: LeadSource[];
  leadStatuses: LeadStatus[];
  dealStatuses: DealStatus[];
  productCategories: ProductCategory[];
  priceLists: PriceList[];
  emailTemplates: EmailTemplate[];
  quotationTemplates: QuotationTemplate[];
  invoiceTemplates: InvoiceTemplate[];
  notifications: NotificationSettings;
  automationRules: AutomationRule[];
  integrations: IntegrationSettings;
  paymentGateways: PaymentGatewaySettings;
}

// API Response Types
export interface BusinessSettingsResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Form Types
export interface BusinessSettingsFormData {
  category: string;
  data: any;
}

// Settings Category Configuration
export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  permission: string;
  order: number;
  sections: SettingsSection[];
}

export interface SettingsSection {
  id: string;
  name: string;
  description: string;
  fields: SettingsField[];
}

export interface SettingsField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'file' | 'color';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: { value: string; label: string }[];
  dependsOn?: string;
  description?: string;
}