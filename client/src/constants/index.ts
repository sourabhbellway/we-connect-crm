// Application Constants
export const APP_CONSTANTS = {
  NAME: "WeConnect CRM",
  DESCRIPTION: "Full-stack CRM application with role-based access control",
  VERSION: "1.0.0",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh-token",
    PROFILE: "/api/auth/profile",
  },
  USERS: {
    BASE: "/api/users",
    STATS: "/api/users/stats",
    SEARCH: "/api/users/search",
  },
  ROLES: {
    BASE: "/api/roles",
    SEARCH: "/api/roles/search",
  },
  LEADS: {
    BASE: "/leads",
    STATS: "/leads/stats",
    SEARCH: "/leads/search",
  },
  DEALS: {
    BASE: "/deals",
    STATS: "/deals/stats",
    SEARCH: "/deals/search",
  },
  PERMISSIONS: {
    BASE: "/api/permissions",
  },
  ACTIVITIES: {
    BASE: "/api/activities",
    RECENT: "/api/activities/recent",
    STATS: "/api/activities/stats",
  },
  HEALTH: "/api/health",
} as const;

// UI Configuration
export const UI_CONFIG = {
  COLORS: {
    // WeConnect Brand Colors
    PRIMARY: "#EF444E", // WeConnect Red
    PRIMARY_HOVER: "#d63840",
    BLACK: "#292C2B", // WeConnect Black
    WHITE: "#FFFFFF",

    // Secondary Brand Colors
    BLUE: "#446AEF",
    ORANGE: "#F76C38",
    GREEN: "#5ED790",
    PURPLE: "#AC5ADE",
    CYAN: "#63DCE4",

    // Semantic Colors (using brand colors)
    SUCCESS: "#5ED790", // Brand Green
    ERROR: "#EF444E", // WeConnect Red
    WARNING: "#F76C38", // Brand Orange
    INFO: "#446AEF", // Brand Blue

    // Neutral Grays
    GRAY: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  GRID: {
    COLUMN_WIDTH: 30, // 30px grid system
    GUTTER: 15, // Half column for gutters
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  },
  DEBOUNCE_DELAY: 500,
  ANIMATION_DURATION: 300,
} as const;

// User Roles and Permissions
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  HR: "hr",
  EMPLOYEE: "employee",
} as const;

export const PERMISSIONS = {
  USER: {
    CREATE: "user.create",
    READ: "user.read",
    UPDATE: "user.update",
    DELETE: "user.delete",
  },
  ROLE: {
    CREATE: "role.create",
    READ: "role.read",
    UPDATE: "role.update",
    DELETE: "role.delete",
  },
  PERMISSION: {
    CREATE: "permission.create",
    READ: "permission.read",
    UPDATE: "permission.update",
    DELETE: "permission.delete",
  },
  LEAD: {
    CREATE: "lead.create",
    READ: "lead.read",
    UPDATE: "lead.update",
    DELETE: "lead.delete",
    TRANSFER: "lead.transfer",
    CONVERT: "lead.convert",
    EXPORT: "lead.export",
    IMPORT: "lead.import",
  },
  DEAL: {
    CREATE: "deal.create",
    READ: "deal.read",
    UPDATE: "deal.update",
    DELETE: "deal.delete",
  },
  CONTACT: {
    CREATE: "contact.create",
    READ: "contact.read",
    UPDATE: "contact.update",
    DELETE: "contact.delete",
  },
  ACTIVITY: {
    READ: "activity.read",
  },
  DASHBOARD: {
    READ: "dashboard.read",
  },
  BUSINESS_SETTINGS: {
    READ: "business_settings.read",
    UPDATE: "business_settings.update",
    COMPANY: {
      READ: "business_settings_company.read",
      UPDATE: "business_settings_company.update",
    },
    CURRENCY: {
      CREATE: "business_settings_currency.create",
      READ: "business_settings_currency.read",
      UPDATE: "business_settings_currency.update",
      DELETE: "business_settings_currency.delete",
    },
    TAX: {
      CREATE: "business_settings_tax.create",
      READ: "business_settings_tax.read",
      UPDATE: "business_settings_tax.update",
      DELETE: "business_settings_tax.delete",
    },
    NUMBERING: {
      READ: "business_settings_numbering.read",
      UPDATE: "business_settings_numbering.update",
    },
    DEAL_STATUS: {
      CREATE: "business_settings_deal_status.create",
      READ: "business_settings_deal_status.read",
      UPDATE: "business_settings_deal_status.update",
      DELETE: "business_settings_deal_status.delete",
    },
    LEAD_STATUS: {
      CREATE: "business_settings_lead_status.create",
      READ: "business_settings_lead_status.read",
      UPDATE: "business_settings_lead_status.update",
      DELETE: "business_settings_lead_status.delete",
    },
    LEAD_SOURCE: {
      CREATE: "business_settings_lead_source.create",
      READ: "business_settings_lead_source.read",
      UPDATE: "business_settings_lead_source.update",
      DELETE: "business_settings_lead_source.delete",
    },
    FIELD_CONFIG: {
      CREATE: "business_settings_field_config.create",
      READ: "business_settings_field_config.read",
      UPDATE: "business_settings_field_config.update",
      DELETE: "business_settings_field_config.delete",
    },
    INTEGRATIONS: {
      READ: "business_settings_integrations.read",
      UPDATE: "business_settings_integrations.update",
      SYNC: "business_settings_integrations.sync",
    },
    TEMPLATES: {
      QUOTATION: {
        CREATE: "business_settings_quotation_template.create",
        READ: "business_settings_quotation_template.read",
        UPDATE: "business_settings_quotation_template.update",
        DELETE: "business_settings_quotation_template.delete",
      },
      TERMS: {
        CREATE: "business_settings_terms_conditions.create",
        READ: "business_settings_terms_conditions.read",
        UPDATE: "business_settings_terms_conditions.update",
        DELETE: "business_settings_terms_conditions.delete",
      },
      EMAIL: {
        CREATE: "business_settings_email_template.create",
        READ: "business_settings_email_template.read",
        UPDATE: "business_settings_email_template.update",
        DELETE: "business_settings_email_template.delete",
      },
    },
  },
  QUOTATION: {
    CREATE: "quotation.create",
    READ: "quotation.read",
    UPDATE: "quotation.update",
    DELETE: "quotation.delete",
  },
  INVOICE: {
    CREATE: "invoice.create",
    READ: "invoice.read",
    UPDATE: "invoice.update",
    DELETE: "invoice.delete",
  },
  TASK: {
    CREATE: "tasks.create",
    READ: "tasks.read",
    UPDATE: "tasks.update",
    DELETE: "tasks.delete",
  },
  EXPENSE: {
    CREATE: "expense.create",
    READ: "expense.read",
    UPDATE: "expense.update",
    DELETE: "expense.delete",
    APPROVE: "expense.approve",
  },
  AUTOMATION: {
    CREATE: "automation.create",
    READ: "automation.read",
    UPDATE: "automation.update",
    DELETE: "automation.delete",
  },
  PRODUCT: {
    CREATE: "products.create",
    READ: "products.read",
    UPDATE: "products.update",
    DELETE: "products.delete",
    IMPORT: "products.import",
    EXPORT: "products.export",
  },
  PRODUCT_CATEGORY: {
    CREATE: "product_categories.create",
    READ: "product_categories.read",
    UPDATE: "product_categories.update",
    DELETE: "product_categories.delete",
  },
  INDUSTRY: {
    CREATE: "industries.create",
    READ: "industries.read",
    UPDATE: "industries.update",
    DELETE: "industries.delete",
  },
  TEAM: {
    CREATE: "teams.create",
    READ: "teams.read",
    UPDATE: "teams.update",
    DELETE: "teams.delete",
  },
  TRASH: {
    READ: "trash.read",
    RESTORE: "trash.restore",
    DELETE: "trash.delete",
  },
  TAG: {
    CREATE: "tags.create",
    READ: "tags.read",
    UPDATE: "tags.update",
    DELETE: "tags.delete",
  },
  UNIT_TYPE: {
    CREATE: "unit_types.create",
    READ: "unit_types.read",
    UPDATE: "unit_types.update",
    DELETE: "unit_types.delete",
  },
  NOTIFICATION: {
    READ: "notifications.read",
    UPDATE: "notifications.update",
    DELETE: "notifications.delete",
  },
  NOTE: {
    CREATE: "notes.create",
    READ: "notes.read",
    UPDATE: "notes.update",
    DELETE: "notes.delete",
  },
  PAYMENT: {
    CREATE: "payments.create",
    READ: "payments.read",
    UPDATE: "payments.update",
    DELETE: "payments.delete",
  },
  PROPOSAL_TEMPLATE: {
    CREATE: "proposal_templates.create",
    READ: "proposal_templates.read",
    UPDATE: "proposal_templates.update",
    DELETE: "proposal_templates.delete",
  },
  COMMUNICATION: {
    CREATE: "communications.create",
    READ: "communications.read",
    UPDATE: "communications.update",
    DELETE: "communications.delete",
  },
  DASHBOARD_WIDGETS: {
    STATS_USERS: "dashboard_widgets.read", // Using a generic read for widgets
    STATS_ROLES: "dashboard_widgets.read",
    STATS_LEADS: "dashboard_widgets.read",
    SYSTEM_STATUS: "dashboard_widgets.read",
    SYSTEM_ACTIVITY: "dashboard_widgets.read",
    ACTIVITY_CALENDAR: "dashboard_widgets.read",
    PERFORMANCE: "dashboard_widgets.read",
    REVENUE_METRICS: "dashboard_widgets.read",
    ACTIVITY_ENGAGEMENT: "dashboard_widgets.read",
  },
  CALL_LOG: {
    READ: "activity.read", // Mapping back to activity for now as backend uses activity.read
  },
} as const;

// Lead Statuses
export const LEAD_STATUSES = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  CLOSED: "closed",
  LOST: "lost",
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /\S+@\S+\.\S+/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: {
    MIN_LENGTH: 6,
    REGEX: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  THEME: "theme",
  LANGUAGE: "language",
  REMEMBER_ME: "rememberMe",
  REMEMBERED_EMAIL: "rememberedEmail",
  DASHBOARD_TODOS: "dashboardActivityTodos",
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  POSITION: "top-right",
  AUTO_CLOSE: 5000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  DISPLAY_WITH_TIME: "MMM DD, YYYY HH:mm",
  API: "YYYY-MM-DD",
  API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
} as const;

// Component Variants
export const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  OUTLINE: "outline",
  GHOST: "ghost",
  DESTRUCTIVE: "destructive",
} as const;

export const BUTTON_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
} as const;

export const CARD_VARIANTS = {
  DEFAULT: "default",
  ELEVATED: "elevated",
  OUTLINED: "outlined",
  GRADIENT: "gradient",
} as const;

// Business Settings Constants
export const BUSINESS_SETTINGS = {
  CATEGORIES: {
    COMPANY: "company",
    CURRENCY_TAX: "currency_tax",
    LEAD_SOURCES: "lead_sources",
    LEAD_STATUSES: "lead_statuses",
    PRODUCTS: "products",
    TEMPLATES: "templates",
    NOTIFICATIONS: "notifications",
    AUTOMATION: "automation",
    INTEGRATIONS: "integrations",
    PAYMENTS: "payments",
  },
  CURRENCIES: {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    INR: "INR",
    AUD: "AUD",
    CAD: "CAD",
  },
  TAX_TYPES: {
    GST: "GST",
    VAT: "VAT",
    SALES_TAX: "SALES_TAX",
    CUSTOM: "CUSTOM",
  },
  DEAL_STAGES: {
    LEAD: "lead",
    QUALIFIED: "qualified",
    PROPOSAL: "proposal",
    NEGOTIATION: "negotiation",
    CLOSED_WON: "closed_won",
    CLOSED_LOST: "closed_lost",
  },
  NOTIFICATION_CHANNELS: {
    EMAIL: "email",
    SMS: "sms",
    WHATSAPP: "whatsapp",
    PUSH: "push",
    IN_APP: "in_app",
  },
  AUTOMATION_TRIGGERS: {
    LEAD_CREATED: "lead_created",
    DEAL_STAGE_CHANGED: "deal_stage_changed",
    TASK_OVERDUE: "task_overdue",
    PAYMENT_RECEIVED: "payment_received",
    CUSTOM: "custom",
  },
} as const;

// Default Business Settings
export const DEFAULT_BUSINESS_SETTINGS = {
  company: {
    name: "Your Company",
    email: "contact@company.com",
    phone: "",
    address: "",
    website: "",
    gstNumber: "",
    timezone: "UTC",
  },
  currency: {
    primary: BUSINESS_SETTINGS.CURRENCIES.USD,
    symbol: "$",
    decimalPlaces: 2,
  },
  tax: {
    defaultRate: 18,
    type: BUSINESS_SETTINGS.TAX_TYPES.GST,
    inclusive: false,
  },
  leadSources: ["Website", "Social Media", "Email Campaign", "Referral", "Cold Call", "Trade Show"],
  leadStatuses: [
    { name: "Lead", probability: 10, color: "#6B7280" },
    { name: "Qualified", probability: 25, color: "#3B82F6" },
    { name: "Proposal", probability: 50, color: "#F59E0B" },
    { name: "Negotiation", probability: 75, color: "#8B5CF6" },
    { name: "Closed Won", probability: 100, color: "#10B981" },
    { name: "Closed Lost", probability: 0, color: "#EF4444" },
  ],
} as const;
