import React, { useEffect, useState } from "react";
import InputField, { TextAreaField } from "./InputField";
import { EnhancedSelectField } from "./EnhancedSelectField";
import PhoneInputWithCountry from "./PhoneInputWithCountry";
import { LeadPayload } from "../services/leadService";
import { userService } from "../services/userService";
// Lead sources and field configs now come from BusinessSettingsContext
import { tagService, Tag } from "../services/tagService";
import { industryService, Industry } from "../services/industryService";
import { productsService, Product } from "../services/productsService";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";
import { countries } from "../data/countries";
import { Country as CSCCountry, State, City } from 'country-state-city';
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../services/apiClient";
import {
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Briefcase as BriefcaseIcon,
  ListFilter,
  UserCheck,
  Flag,
  Globe,
  MapPin,
  Users,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  Linkedin,
  MessageSquare,
  DollarSign,
  Package,
  Plus,
  Trash2,
} from "lucide-react";

export interface LeadFormProps {
  initial?: LeadPayload;
  onSubmit: (data: LeadPayload) => Promise<void> | void;
  submitting?: boolean;
  skipInternalLoadingUI?: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface FormState {
  form: LeadPayload;
  errors: ValidationErrors;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

interface FieldConfig {
  id: number;
  entityType: string;
  fieldName: string;
  label: string;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  section: string;
  placeholder?: string;
  helpText?: string;
  validation?: any;
  options?: any;
}

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: FieldConfig[];
  color: string;
}

interface LeadSection {
  id: number;
  key: string;
  label: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

const defaultState: LeadPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  position: "",
  sourceId: undefined,
  status: "new",
  notes: "",
  assignedTo: undefined,
  tags: [],
  // Enhanced fields
  budget: undefined,
  currency: "Rs",
  priority: "medium",
  website: "",
  address: "",
  industry: "",
  companySize: undefined,
  annualRevenue: undefined,
  leadScore: undefined,
  productId: undefined,
  products: [],
  country: "",
  state: "",
  city: "",
  zipCode: "",
  linkedinProfile: "",
  timezone: "",
  preferredContactMethod: "email",
  lastContactedAt: undefined,
  nextFollowUpAt: undefined,
  customFields: {},
};

const LeadForm: React.FC<LeadFormProps> = ({
  initial,
  onSubmit,
  submitting,
}) => {
  const { currencySettings, leadStatuses } = useBusinessSettings();
  const { user: currentUser } = useAuth();

  // Check if user is admin or super admin
  const isAdmin = currentUser?.roles?.some(
    (role) => role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'super admin' || role.name.toLowerCase() === 'super_admin'
  ) || false;

  const [formState, setFormState] = useState<FormState>({
    form: {
      ...defaultState,
      currency: currencySettings?.primary || "Rs",
      ...(initial || {}),
    },
    errors: {},
    isSubmitting: false,
    hasSubmitted: false,
  });
  const [users, setUsers] = useState<
    Array<{ id: number; firstName: string; lastName: string }>
  >([]);
  const { leadSources: settingsLeadSources } = useBusinessSettings();
  const [selectedLeadSourceId, setSelectedLeadSourceId] = useState<string | number>("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showOtherIndustryInput, setShowOtherIndustryInput] = useState(false);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [sections, setSections] = useState<LeadSection[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Country to Currency mapping
  // Imported from utils/countryUtils

  // Currency options with symbols and descriptions
  const getCurrencyOptions = () => {
    const commonCurrencies = [
      { value: "USD", label: "USD ($)", description: "US Dollar", symbol: "$" },
      { value: "EUR", label: "EUR (€)", description: "Euro", symbol: "€" },
      { value: "GBP", label: "GBP (£)", description: "British Pound", symbol: "£" },
      { value: "INR", label: "INR (₹)", description: "Indian Rupee", symbol: "₹" },
      { value: "JPY", label: "JPY (¥)", description: "Japanese Yen", symbol: "¥" },
      { value: "CNY", label: "CNY (¥)", description: "Chinese Yuan", symbol: "¥" },
      { value: "CAD", label: "CAD ($)", description: "Canadian Dollar", symbol: "$" },
      { value: "AUD", label: "AUD ($)", description: "Australian Dollar", symbol: "$" },
      { value: "SGD", label: "SGD ($)", description: "Singapore Dollar", symbol: "$" },
      { value: "HKD", label: "HKD ($)", description: "Hong Kong Dollar", symbol: "$" },
      { value: "AED", label: "AED (د.إ)", description: "UAE Dirham", symbol: "د.إ" },
      { value: "SAR", label: "SAR (﷼)", description: "Saudi Riyal", symbol: "﷼" },
      { value: "QAR", label: "QAR (﷼)", description: "Qatari Riyal", symbol: "﷼" },
    ];

    // If we have currencies from settings, use them
    if (currencySettings?.currencies && currencySettings.currencies.length > 0) {
      return currencySettings.currencies.map(c => ({
        value: c.code,
        label: `${c.code} (${c.symbol})`,
        description: c.name,
        symbol: c.symbol
      })).sort((a, b) => {
        const primary = currencySettings.primary || "USD";
        if (a.value === primary) return -1;
        if (b.value === primary) return 1;
        return a.label.localeCompare(b.label);
      });
    }

    // Fallback to common currencies if none in settings
    let filtered = commonCurrencies;
    if (currencySettings?.supportedCurrencies && currencySettings.supportedCurrencies.length > 0) {
      // Create a map for quick lookup
      const supportedSet = new Set(currencySettings.supportedCurrencies);
      // We still include the primary even if not in supported (should be though)
      if (currencySettings.primary) supportedSet.add(currencySettings.primary);

      filtered = commonCurrencies.filter(c => supportedSet.has(c.value));

      // Add any supported currencies that are NOT in our common list
      currencySettings.supportedCurrencies.forEach(code => {
        if (!commonCurrencies.find(c => c.value === code)) {
          filtered.push({
            value: code,
            label: `${code}`,
            description: code,
            symbol: "" // We'll handle this in getCurrencySymbol
          });
        }
      });
    }

    // Sort: Primary first, then alphabetically
    const primary = currencySettings?.primary || "Rs";
    return filtered.sort((a, b) => {
      if (a.value === primary) return -1;
      if (b.value === primary) return 1;
      return a.label.localeCompare(b.label);
    });
  };

  // Get currency symbol by currency code
  const getCurrencySymbol = (currencyCode: string): string => {
    // Check if symbol exists in currencySettings first
    if (currencySettings?.currencies) {
      const match = currencySettings.currencies.find(c => c.code === currencyCode);
      if (match?.symbol) return match.symbol;
    }

    const currencyMap: { [key: string]: string } = {
      "USD": "$",
      "EUR": "€",
      "GBP": "£",
      "INR": "₹",
      "JPY": "¥",
      "CNY": "¥",
      "CAD": "C$",
      "AUD": "A$",
      "SGD": "S$",
      "HKD": "HK$",
      "CHF": "₣",
      "KRW": "₩",
      "MXN": "MX$",
      "BRL": "R$",
      "RUB": "₽",
      "ZAR": "R",
      "TRY": "₺",
      "NOK": "kr",
      "SEK": "kr",
      "DKK": "kr",
      "PLN": "zł",
      "CZK": "Kč",
      "HUF": "Ft",
      "ILS": "₪",
      "AED": "د.إ",
      "SAR": "﷼",
      "THB": "฿",
      "MYR": "RM",
      "IDR": "Rp",
      "PHP": "₱",
      "VND": "₫",
      "KGS": "сом",
      "KPW": "₩",
      "SYP": "£",
      "UYU": "$U",
      "YER": "﷼"
    };

    return currencyMap[currencyCode] || currencyCode;
  };

  useEffect(() => {
    if (initial) {
      // Convert tags from objects to IDs if needed
      const tagsArray = initial.tags
        ? Array.isArray(initial.tags)
          ? initial.tags.map((t: any) => typeof t === 'object' ? t.id : t).filter(Boolean)
          : []
        : [];

      setFormState((prev) => ({
        ...prev,
        form: {
          ...defaultState,
          currency: currencySettings?.primary || "Rs",
          ...initial,
          tags: tagsArray,
        },
      }));

      // Initialize selectedLeadSourceId from initial sourceId
      if (initial.sourceId) {
        setSelectedLeadSourceId(initial.sourceId);
      }
    }
  }, [initial, currencySettings]);

  // Update currency when business settings load
  useEffect(() => {
    if (currencySettings && !initial) {
      setFormState((prev) => ({
        ...prev,
        form: {
          ...prev.form,
          currency: prev.form.currency || currencySettings.primary,
        },
      }));
    }
  }, [currencySettings, initial]);

  // Fetch states based on country
  useEffect(() => {
    if (formState.form.country) {
      const countryObj = CSCCountry.getAllCountries().find(c => c.name === formState.form.country);
      if (countryObj) {
        const fetchedStates = State.getStatesOfCountry(countryObj.isoCode);
        setStates(fetchedStates);
      } else {
        setStates([]);
      }
    } else {
      setStates([]);
    }
  }, [formState.form.country]);

  // Fetch cities based on state
  useEffect(() => {
    if (formState.form.country && formState.form.state) {
      const countryObj = CSCCountry.getAllCountries().find(c => c.name === formState.form.country);
      const stateObj = states.find(s => s.name === formState.form.state);
      if (countryObj && stateObj) {
        const fetchedCities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
        setCities(fetchedCities);
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [formState.form.country, formState.form.state, states]);



  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, tagsRes, industriesRes, productsRes] = await Promise.all([
          userService.getUsers(),
          tagService.getTags(),
          industryService.getIndustries().catch(() => []), // Handle errors gracefully
          productsService.list().catch(() => []), // Handle errors gracefully
        ]);

        // Handle different API response structures - normalize to arrays
        const usersData =
          (usersRes as any)?.data ??
          (usersRes as any)?.users ??
          usersRes;
        // Lead sources now managed via BusinessSettingsContext (settingsLeadSources)
        const tagsData =
          (tagsRes as any)?.data ?? (tagsRes as any)?.tags ?? tagsRes;
        const productsData =
          (productsRes as any)?.data?.items ??
          (productsRes as any)?.data?.products ??
          (Array.isArray((productsRes as any)?.data) ? (productsRes as any)?.data : undefined) ??
          (productsRes as any)?.products ??
          (productsRes as any)?.items ??
          productsRes;

        setUsers(Array.isArray(usersData) ? usersData : []);
        // No set needed; using settingsLeadSources
        setAllTags(Array.isArray(tagsData) ? tagsData : []);
        setIndustries(Array.isArray(industriesRes) ? industriesRes : []);
        setProducts(Array.isArray(productsData) ? productsData : []);

        if (!Array.isArray(tagsData)) {
          console.warn('Tags payload not array:', tagsRes);
        }
      } catch (e) {
        console.error("Error loading form data:", e);
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            general: "Failed to load form data. Please refresh the page.",
          },
        }));
        // Set empty arrays as fallback, or sample data for testing
        setUsers([]);
        setAllTags([]);
        setIndustries([]);
        setProducts([]);

        // Add some sample data for testing if APIs fail
        console.log("Setting fallback empty arrays due to API error");
        // Initialize the lead source select from existing value
        if (formState.form.sourceId) {
          setSelectedLeadSourceId(formState.form.sourceId);
        }
      } finally {
      }
    };
    load();
  }, []);

  // Sync currency from Business Settings when it loads (may load after form init)
  useEffect(() => {
    if (currencySettings?.primary && !initial?.currency) {
      setFormState((prev) => {
        // Only update if still on fallback "USD" and settings have a different default
        if (prev.form.currency === "USD" && currencySettings.primary !== "USD") {
          return {
            ...prev,
            form: { ...prev.form, currency: currencySettings.primary },
          };
        }
        return prev;
      });
    }
  }, [currencySettings?.primary]);

  // Check if current industry is in the list or needs "Other" input
  useEffect(() => {
    if (formState.form.industry) {
      const industryExists = industries.some(
        (ind) => ind.isActive && ind.name.toLowerCase() === formState.form.industry?.toLowerCase()
      );
      // If industry doesn't exist in the list, show "Other" input
      setShowOtherIndustryInput(!industryExists);
    } else {
      setShowOtherIndustryInput(false);
    }
  }, [formState.form.industry, industries]);

  // Fetch field configurations (exposed so other components can trigger a refresh)
  const fetchFieldConfigs = async () => {
    try {
      const response = await apiClient.get('/business-settings/field-configs/lead');
      if (response.data?.success) {
        let configs = response.data.data;
        // Inject ownerId if it doesn't exist
        const hasOwnerId = configs.some((f: any) => f.fieldName === 'ownerId');
        if (!hasOwnerId) {
          configs.push({
            id: -1,
            entityType: 'lead',
            fieldName: 'ownerId',
            label: 'Lead Owner',
            isRequired: false,
            isVisible: true,
            displayOrder: 99,
            section: 'lead_management',
            placeholder: 'Select owner'
          });
        }
        setFieldConfigs(configs);
      }
    } catch (error) {
      console.error('Error fetching field configs:', error);
      // Fallback to empty configs if API fails
      setFieldConfigs([{
        id: -1,
        entityType: 'lead',
        fieldName: 'ownerId',
        label: 'Lead Owner',
        isRequired: false,
        isVisible: true,
        displayOrder: 99,
        section: 'lead_management',
        placeholder: 'Select owner'
      }]);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await apiClient.get('/business-settings/lead-sections');
      if (response.data?.success) {
        setSections(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchFieldConfigs();
    fetchSections();
    const handler = () => {
      fetchFieldConfigs();
      fetchSections();
    };
    window.addEventListener('fieldConfigsUpdated', handler as EventListener);
    return () => window.removeEventListener('fieldConfigsUpdated', handler as EventListener);
  }, []);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    const value = (email || "").trim();
    if (!value) return "Email is required";
    // Basic pattern: allowed local chars, domain labels, and TLD length >= 2
    const basicPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!basicPattern.test(value)) return "Please enter a valid email address";

    const [localPart, domainPart] = value.split("@");
    // Local part cannot start/end with dot and cannot contain consecutive dots
    if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
      return "Please enter a valid email address";
    }
    // Domain cannot contain consecutive dots
    if (domainPart.includes("..")) {
      return "Please enter a valid email address";
    }
    // Each domain label must not start/end with hyphen and must be non-empty
    const labels = domainPart.split(".");
    if (
      labels.some(
        (label) => !label || label.startsWith("-") || label.endsWith("-")
      )
    ) {
      return "Please enter a valid email address";
    }
    return null;
  };


  // Country-specific phone digit rules (local/national part, excluding country code)
  // For every country in the phone dropdown (from ../data/countries), we apply
  // either a specific rule below or a default rule (7–15 digits) if not listed.
  const phoneDigitRules: Record<string, { min: number; max?: number }> = {
    // Keyed by ISO country code from ../data/countries
    IN: { min: 10, max: 10 }, // India
    US: { min: 10, max: 10 }, // United States
    CA: { min: 10, max: 10 }, // Canada
    GB: { min: 10, max: 10 }, // United Kingdom
    AU: { min: 9, max: 9 },   // Australia (without leading 0)
    AE: { min: 9, max: 9 },   // United Arab Emirates
    SA: { min: 9, max: 9 },   // Saudi Arabia
    SG: { min: 8, max: 8 },   // Singapore
    MY: { min: 9, max: 10 },  // Malaysia
    ID: { min: 10, max: 12 }, // Indonesia
    PK: { min: 10, max: 10 }, // Pakistan
    BD: { min: 10, max: 10 }, // Bangladesh
    NP: { min: 10, max: 10 }, // Nepal
    LK: { min: 9, max: 9 },   // Sri Lanka
    PH: { min: 10, max: 10 }, // Philippines
    ZA: { min: 9, max: 9 },   // South Africa
    NG: { min: 8, max: 10 },  // Nigeria
  };

  // Helper to render icon by name
  const renderIconByName = (iconName: string) => {
    const props = { className: "h-5 w-5" };
    switch (iconName.toLowerCase()) {
      case 'user': return <UserIcon {...props} />;
      case 'building': return <BuildingIcon {...props} />;
      case 'mappin':
      case 'map-pin': return <MapPin {...props} />;
      case 'award': return <Award {...props} />;
      case 'messagesquare':
      case 'message-square': return <MessageSquare {...props} />;
      case 'briefcase': return <BriefcaseIcon {...props} />;
      case 'globe': return <Globe {...props} />;
      case 'trendingup':
      case 'trending-up': return <TrendingUp {...props} />;
      default: return <MessageSquare {...props} />;
    }
  };

  // Group fields by section and sort
  const getGroupedAndSortedFields = (): FormSection[] => {
    if (!fieldConfigs.length) return [];

    const sectionMap: { [key: string]: FormSection } = {};

    // Group fields by section
    const visibleFields = fieldConfigs
      .filter(f => f.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    visibleFields.forEach(field => {
      const sectionKey = field.section || 'other';
      if (!sectionMap[sectionKey]) {
        const sectionInfo = sections.find(s => s.key === sectionKey);
        sectionMap[sectionKey] = {
          id: sectionKey,
          title: sectionInfo?.label || sectionKey.replace(/_/g, ' '),
          icon: sectionInfo ? renderIconByName(sectionInfo.icon) : <MessageSquare className="h-5 w-5" />,
          color: sectionInfo?.color || 'gray',
          fields: [],
        };
      }
      sectionMap[sectionKey].fields.push(field);
    });

    // Sort sections based on the 'sections' metadata from API
    const sortedSectionKeys = sections.map(s => s.key);

    return sortedSectionKeys
      .filter(key => sectionMap[key])
      .map(key => sectionMap[key])
      .concat(
        Object.values(sectionMap)
          .filter(s => !sortedSectionKeys.includes(s.id))
      );
  };

  // Get section color class - Unified for cleaner look
  const getSectionColorClass = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      blue: { bg: 'bg-transparent', icon: 'text-blue-600 dark:text-blue-400', border: 'border-gray-200 dark:border-gray-700' },
      green: { bg: 'bg-transparent', icon: 'text-green-600 dark:text-green-400', border: 'border-gray-200 dark:border-gray-700' },
      purple: { bg: 'bg-transparent', icon: 'text-purple-600 dark:text-purple-400', border: 'border-gray-200 dark:border-gray-700' },
      orange: { bg: 'bg-transparent', icon: 'text-orange-600 dark:text-orange-400', border: 'border-gray-200 dark:border-gray-700' },
      indigo: { bg: 'bg-transparent', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-gray-200 dark:border-gray-700' },
      red: { bg: 'bg-transparent', icon: 'text-red-600 dark:text-red-400', border: 'border-gray-200 dark:border-gray-700' },
      gray: { bg: 'bg-transparent', icon: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
    };
    return colors[color] || colors.gray;
  };

  // Render custom fields dynamically based on field type
  const renderCustomField = (field: FieldConfig) => {
    // Check both customFields and direct form fields
    const value = (formState.form as any)[field.fieldName] !== undefined
      ? (formState.form as any)[field.fieldName]
      : ((formState.form as any).customFields?.[field.fieldName] || '');
    const error = (formState.errors as any)[field.fieldName];
    const fieldType = (field.validation as any)?.type || 'text';

    switch (fieldType.toLowerCase()) {
      case 'number':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            type="number"
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );
      case 'date':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            type="date"
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value || undefined)}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );
      case 'datetime':
      case 'datetime-local':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value || undefined)}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <TextAreaField
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
            required={field.isRequired}
            error={error}
            rows={3}
            placeholder={field.placeholder}
          />
        );
      case 'select':
      case 'dropdown':
        const options = (field.options as any)?.options || (field.options as any) || [];
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            placeholder={field.placeholder || `Select ${field.label}`}
            options={Array.isArray(options) ? options.map((opt: any) => ({
              value: typeof opt === 'string' ? opt : (opt.value || opt),
              label: typeof opt === 'string' ? opt : (opt.label || opt.value || opt),
            })) : []}
            onChange={(v) => {
              // Store in customFields if it's a custom field, otherwise in main form
              if (field.fieldName.startsWith('custom') || !(formState.form as any).hasOwnProperty(field.fieldName)) {
                handleCustomFieldChange(field.fieldName, v);
              } else {
                handleChange(field.fieldName, v);
              }
            }}
            searchable={true}
            clearable={!field.isRequired}
            required={field.isRequired}
            error={error}
          />
        );
      case 'checkbox':
        return (
          <div key={field.fieldName} className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && (
              <p className="ml-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>
        );
      default:
        // Default to text input
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            onChange={(e) => {
              // Store in customFields if it's a custom field, otherwise in main form
              if (field.fieldName.startsWith('custom') || !(formState.form as any).hasOwnProperty(field.fieldName)) {
                handleCustomFieldChange(field.fieldName, e.target.value);
              } else {
                handleChange(field.fieldName, e.target.value);
              }
            }}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Dynamic field rendering
  const renderField = (field: FieldConfig) => {
    // Check both direct form fields and customFields
    const value = (formState.form as any)[field.fieldName] !== undefined
      ? (formState.form as any)[field.fieldName]
      : ((formState.form as any).customFields?.[field.fieldName]);
    const error = (formState.errors as any)[field.fieldName];

    // If this is a custom field (not in the standard switch cases), use renderCustomField
    const isCustomField = ![
      'firstName', 'lastName', 'email', 'phone', 'company', 'position', 'industry',
      'website', 'companySize', 'annualRevenue', 'country', 'state', 'city', 'zipCode',
      'address', 'timezone', 'linkedinProfile', 'sourceId', 'status', 'priority',
      'assignedTo', 'ownerId', 'budget', 'currency', 'leadScore', 'preferredContactMethod',
      'nextFollowUpAt', 'notes', 'tags', 'productId'
    ].includes(field.fieldName);

    if (isCustomField) {
      return renderCustomField(field);
    }

    switch (field.fieldName) {
      case 'firstName':
      case 'lastName':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );

      case 'email':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
            type="email"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            required={field.isRequired}
            error={error}
            placeholder={field.placeholder}
          />
        );

      case 'phone':
        return (
          <PhoneInputWithCountry
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            onChange={(fullPhone) => handleChange(field.fieldName, fullPhone)}
            error={error}
            placeholder={field.placeholder || "Enter  number"}
            required={field.isRequired}
          />
        );

      case 'company':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<BuildingIcon className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            error={error}
            required={field.isRequired}
            placeholder={field.placeholder}
          />
        );

      case 'position':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<BriefcaseIcon className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            error={error}
            required={field.isRequired}
            placeholder={field.placeholder}
          />
        );

      case 'productId':
        // Hide individual productId field since we use a dedicated Products section
        return null;

      case 'industry':
        return (
          <div key={field.fieldName}>
            <EnhancedSelectField
              label={field.label}
              leftIcon={<TrendingUp className="h-4 w-4 text-gray-400" />}
              value={showOtherIndustryInput ? "Other" : (value || "")}
              onChange={(v) => {
                if (v === "Other") {
                  setShowOtherIndustryInput(true);
                  handleChange(field.fieldName, "");
                } else {
                  setShowOtherIndustryInput(false);
                  handleChange(field.fieldName, v);
                }
              }}
              options={[
                ...industries
                  .filter((ind) => ind.isActive)
                  .map((ind) => ({
                    value: ind.name,
                    label: ind.name,
                  })),
                { value: "Other", label: "Other" },
              ]}
              placeholder={field.placeholder || "Select industry"}
              required={field.isRequired}
              error={error}
            />
            {showOtherIndustryInput && (
              <div className="mt-2">
                <InputField
                  label="Specify Industry"
                  leftIcon={<TrendingUp className="h-4 w-4 text-gray-400" />}
                  value={value || ""}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  placeholder="e.g. Technology, Healthcare"
                />
              </div>
            )}
          </div>
        );

      case 'website':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Globe className="h-4 w-4 text-gray-400" />}
            type="url"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || "https://company.com"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'companySize':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Users className="h-4 w-4 text-gray-400" />}
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder || "Number of employees"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'annualRevenue':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
            type="number"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder || "Annual revenue"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'country':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Flag className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            placeholder={field.placeholder || "Select country"}
            options={CSCCountry.getAllCountries().map((country) => ({
              value: country.name,
              label: `${country.flag} ${country.name}`,
            }))}
            onChange={(v) => {
              handleChange(field.fieldName, v || "");
              handleChange("state", "");
              handleChange("city", "");

              // Auto-select currency based on country - REMOVED per user request
              // Currency should default to business settings and only change if user explicitly changes the currency field
              /*
              if (v) {
                const countryObj = CSCCountry.getAllCountries().find(c => c.name === v);
                if (countryObj && countryObj.currency) {
                  handleChange("currency", countryObj.currency);
                } else {
                  // Fallback to local mapping if library doesn't have it
                  const fallback = countryToCurrency[v];
                  if (fallback) handleChange("currency", fallback);
                }
              }
              */
            }}
            searchable={true}
            clearable={true}
            required={field.isRequired}
            error={error}
          />
        );

      case 'state':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            placeholder={field.placeholder || "Select state"}
            options={states.map((state) => ({
              value: state.name,
              label: state.name,
            }))}
            onChange={(v) => {
              handleChange(field.fieldName, v || "");
              handleChange("city", "");
            }}
            searchable={true}
            disabled={!formState.form.country}
            required={field.isRequired}
            error={error}
          />
        );

      case 'city':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            placeholder={field.placeholder || "Select city"}
            options={cities.map((city) => ({
              value: city.name,
              label: city.name,
            }))}
            onChange={(v) => {
              handleChange(field.fieldName, v || "");
              handleChange("zipCode", "");
            }}
            searchable={true}
            disabled={!formState.form.state}
            required={field.isRequired}
            error={error}
          />
        );

      case 'zipCode':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || "ZIP/Postal Code"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'address':
        return (
          <TextAreaField
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || "Address"}
            rows={3}
            required={field.isRequired}
            error={error}
          />
        );

      case 'timezone':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Clock className="h-4 w-4 text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || "e.g. PST, EST, GMT"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'linkedinProfile':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Linkedin className="h-4 w-4 text-gray-400" />}
            type="url"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder || "LinkedIn URL"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'sourceId':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
            value={selectedLeadSourceId}
            placeholder={field.placeholder || "Select source"}
            options={[
              { value: "", label: "Select source" },
              ...Array.isArray(settingsLeadSources) ? settingsLeadSources
                .filter((s: any) => s.isActive !== false)
                .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((s: any) => ({
                  value: s.id || s.name,
                  label: s.name,
                  description: s.description || undefined
                })) : []
            ]}
            onChange={(v) => {
              setSelectedLeadSourceId(v);
              const n = Number(v);
              handleChange(field.fieldName, Number.isFinite(n) ? n : undefined);
            }}
            searchable={true}
            clearable={true}
            required={field.isRequired}
            error={error}
          />
        );

      case 'status':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
            value={value || "new"}
            placeholder={field.placeholder || "Select status"}
            options={leadStatuses
              .filter(s => s.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(s => ({
                value: s.name.toLowerCase(),
                label: s.name,
              }))}
            onChange={(v) => handleChange(field.fieldName, v)}
            searchable={false}
            clearable={false}
            required={field.isRequired}
            error={error}
          />
        );

      case 'priority':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Flag className="h-4 w-4 text-gray-400" />}
            value={value || "medium"}
            placeholder={field.placeholder || "Select priority"}
            options={[
              { value: "low", label: "Low", icon: <span className="text-green-500">●</span>, description: "Low priority" },
              { value: "medium", label: "Medium", icon: <span className="text-yellow-500">●</span>, description: "Medium priority" },
              { value: "high", label: "High", icon: <span className="text-orange-500">●</span>, description: "High priority" },
              { value: "urgent", label: "Urgent", icon: <span className="text-red-500">●</span>, description: "Urgent priority" }
            ]}
            onChange={(v) => handleChange(field.fieldName, v)}
            searchable={false}
            clearable={false}
            required={field.isRequired}
            error={error}
          />
        );

      case 'assignedTo':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<UserCheck className="h-4 w-4 text-gray-400" />}
            value={value ?? ""}
            placeholder={field.placeholder || "Select user"}
            options={[
              { value: "", label: "Select user" },
              ...Array.isArray(users) ? users.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
                icon: <UserIcon className="h-4 w-4 text-blue-500" />,
                description: `User ID: ${u.id}`
              })) : []
            ]}
            onChange={(v) => handleChange(field.fieldName, v ? Number(v) : undefined)}
            searchable={true}
            clearable={true}
            required={field.isRequired}
            error={error}
          />
        );

      case 'ownerId':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label || "Lead Owner"}
            leftIcon={<UserCheck className="h-4 w-4 text-gray-400" />}
            value={value ?? ""}
            placeholder={field.placeholder || "Select owner"}
            options={[
              { value: "", label: "Select owner" },
              ...Array.isArray(users) ? users.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
                icon: <UserIcon className="h-4 w-4 text-blue-500" />,
                description: `User ID: ${u.id}`
              })) : []
            ]}
            onChange={(v) => handleChange(field.fieldName, v ? Number(v) : undefined)}
            searchable={true}
            clearable={true}
            required={field.isRequired}
            disabled={!isAdmin}
            error={error}
          />
        );

      case 'budget': {
        const currencyField = fieldConfigs.find(f => f.fieldName === 'currency');
        const isCurrencyVisible = currencyField?.isVisible ?? true;

        if (!isCurrencyVisible) {
          return (
            <InputField
              key={field.fieldName}
              label={field.label}
              leftIcon={
                <span className="text-gray-400 font-medium text-sm">
                  {getCurrencySymbol(formState.form.currency || currencySettings?.primary || "Rs")}
                </span>
              }
              type="number"
              step="0.01"
              value={value || ""}
              onChange={(e) => handleChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={field.placeholder || "Enter amount"}
              required={field.isRequired}
              error={error}
            />
          );
        }

        return (
          <div key={field.fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <InputField
                  leftIcon={
                    <span className="text-gray-400 font-medium text-sm">
                      {getCurrencySymbol(formState.form.currency || currencySettings?.primary || "USD")}
                    </span>
                  }
                  type="number"
                  step="0.01"
                  value={value || ""}
                  onChange={(e) => handleChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={field.placeholder || "Enter amount"}
                  error={error}
                />
              </div>
              <div>
                <EnhancedSelectField
                  value={formState.form.currency || currencySettings?.primary || "USD"}
                  placeholder="Currency"
                  options={getCurrencyOptions()}
                  onChange={(v) => handleChange("currency", v)}
                  searchable
                  clearable={false}
                  error={(formState.errors as any).currency}
                />
              </div>
            </div>
          </div>
        );
      }

      case 'currency': {
        const budgetField = fieldConfigs.find(f => f.fieldName === 'budget');
        const isBudgetVisible = budgetField?.isVisible ?? true;

        // If budget is visible, it already includes the currency selector
        if (isBudgetVisible) return null;

        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
            value={value || currencySettings?.primary || "Rs"}
            placeholder={field.placeholder || "Select currency"}
            options={getCurrencyOptions()}
            onChange={(v) => handleChange(field.fieldName, v)}
            searchable={true}
            clearable={false}
            required={field.isRequired}
            error={error}
          />
        );
      }

      case 'leadScore':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Award className="h-4 w-4 text-gray-400" />}
            type="number"
            min="0"
            max="100"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder || "Score (0-100)"}
            required={field.isRequired}
            error={error}
          />
        );

      case 'preferredContactMethod':
        return (
          <EnhancedSelectField
            key={field.fieldName}
            label={field.label}
            leftIcon={<MessageSquare className="h-4 w-4 text-gray-400" />}
            value={value || "email"}
            placeholder={field.placeholder || "Select contact method"}
            options={[
              { value: "email", label: "Email", icon: <Mail className="h-4 w-4 text-blue-500" />, description: "Contact via email" },
              { value: "phone", label: "Phone", icon: <PhoneIcon className="h-4 w-4 text-green-500" />, description: "Contact via phone call" },
              { value: "sms", label: "SMS", icon: <MessageSquare className="h-4 w-4 text-purple-500" />, description: "Contact via SMS" },
              { value: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-4 w-4 text-green-600" />, description: "Contact via WhatsApp" },
              { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4 text-blue-600" />, description: "Contact via LinkedIn" }
            ]}
            onChange={(v) => handleChange(field.fieldName, v)}
            searchable={false}
            clearable={false}
            required={field.isRequired}
            error={error}
          />
        );

      case 'nextFollowUpAt':
        return (
          <InputField
            key={field.fieldName}
            label={field.label}
            leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
            type="datetime-local"
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, e.target.value || undefined)}
            required={field.isRequired}
            error={error}
          />
        );

      case 'notes':
        return (
          <TextAreaField
            key={field.fieldName}
            label={field.label}
            value={value || ""}
            onChange={(e) => handleChange(field.fieldName, (e.target as HTMLTextAreaElement).value)}
            error={error}
            rows={4}
            placeholder={field.placeholder || "Add any additional notes..."}
            required={field.isRequired}
          />
        );

      case 'tags':
        return (
          <div key={field.fieldName}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {Array.isArray(allTags) &&
                allTags.map((tag) => {
                  const selected = (formState.form.tags || []).includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${selected
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md"
                        : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 hover:border-gray-400"
                        }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              {(!allTags || allTags.length === 0) && (
                <p className="text-sm text-gray-500 italic">No tags available</p>
              )}
            </div>
            {error && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>
        );

      default:
        // Handle custom fields dynamically
        return renderCustomField(field);
    }
  };

  const defaultPhoneRule = { min: 7, max: 15 } as const;

  // Phone validation: required, country-aware digit rules with a 7–15 digit default
  const validatePhone = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return "Phone is required";
    // Allow digits, spaces, +, -, (, )
    if (!/^[0-9+\s()-]+$/.test(v)) {
      return "Phone can only contain digits, spaces, +, -, (, )";
    }

    const digitsOnly = v.replace(/\D/g, "");

    // Try to detect country from the phone value using the longest matching phoneCode
    let matchedCountryCode: string | undefined;
    let matchedPhoneCodeDigitsLength = 0;
    for (const country of countries) {
      const phoneCodeDigits = country.phoneCode.replace(/\D/g, "");
      if (digitsOnly.startsWith(phoneCodeDigits) && phoneCodeDigits.length > matchedPhoneCodeDigitsLength) {
        matchedCountryCode = country.code;
        matchedPhoneCodeDigitsLength = phoneCodeDigits.length;
      }
    }

    // Determine applicable rule (country-specific or default)
    const matchedRule = matchedCountryCode && phoneDigitRules[matchedCountryCode]
      ? phoneDigitRules[matchedCountryCode]
      : defaultPhoneRule;

    if (matchedRule) {
      // Exclude country code digits from the count for validation
      const localDigitsLength = matchedCountryCode && matchedPhoneCodeDigitsLength > 0
        ? digitsOnly.length - matchedPhoneCodeDigitsLength
        : digitsOnly.length;

      if (localDigitsLength < matchedRule.min) {
        return `Phone number must be at least ${matchedRule.min} digits`;
      }
      if (matchedRule.max && localDigitsLength > matchedRule.max) {
        return `Phone number must be at most ${matchedRule.max} digits`;
      }
    }

    return null;
  };

  // Basic change handler used by renderField inputs
  const handleChange = (fieldName: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [fieldName]: value,
      },
      errors: {
        ...prev.errors,
        [fieldName]: ""
      },
    }));
  };

  // Handler for custom fields (stored in customFields object)
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        customFields: {
          ...(prev.form.customFields || {}),
          [fieldName]: value,
        },
      },
      errors: {
        ...prev.errors,
        [fieldName]: ""
      },
    }));
  };

  const toggleTag = (tagId: number) => {
    setFormState(prev => {
      const tags = Array.isArray(prev.form.tags) ? [...prev.form.tags] : [];
      const idx = tags.indexOf(tagId);
      if (idx === -1) tags.push(tagId);
      else tags.splice(idx, 1);
      return { ...prev, form: { ...prev.form, tags } };
    });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    for (const cfg of fieldConfigs) {
      if (cfg.isVisible && cfg.isRequired) {
        // Check both direct form fields and customFields
        const val = (formState.form as any)[cfg.fieldName] ||
          (formState.form.customFields as any)?.[cfg.fieldName];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[cfg.fieldName] = `${cfg.label || cfg.fieldName} is required`;
        } else {
          // Field specific validations
          if (cfg.fieldName === 'email') {
            const e = validateEmail(String(val));
            if (e) errors[cfg.fieldName] = e;
          }
          if (cfg.fieldName === 'phone') {
            const e = validatePhone(String(val));
            if (e) errors[cfg.fieldName] = e;
          }
        }
      }
    }

    setFormState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleAddProductById = (idOrValue: string | number) => {
    const productId = Number(idOrValue);
    if (!productId) return;

    const found = products.find(p => p.id === productId);
    if (!found) return;

    // Don't add if already added (optional, but cleaner)
    if (formState.form.products?.some(p => p.productId === productId)) {
      return;
    }

    setFormState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        products: [
          ...(prev.form.products || []),
          { productId: found.id, name: found.name, quantity: 1, price: found.price }
        ]
      }
    }));
  };

  const removeProduct = (idx: number) => {
    setFormState(prev => {
      const newProducts = [...(prev.form.products || [])];
      newProducts.splice(idx, 1);
      return { ...prev, form: { ...prev.form, products: newProducts } };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      await onSubmit(formState.form);
      setFormState(prev => ({ ...prev, hasSubmitted: true, isSubmitting: false }));
    } catch (err: any) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      console.error('Error submitting lead:', err);

      const data = err?.response?.data;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const apiErrors: ValidationErrors = {};
        data.errors.forEach((e: any) => {
          if (e.field) {
            apiErrors[e.field] = Array.isArray(e.messages) ? e.messages.join(', ') : (e.msg || e.message);
          }
        });
        setFormState(prev => ({ ...prev, errors: { ...prev.errors, ...apiErrors } }));
      }
    }
  };

  // Minimal form rendering: render grouped sections and a submit button
  const formSections = getGroupedAndSortedFields();

  return (
    <form onSubmit={handleSubmit} className="bg-transparent space-y-8">
      {formSections.map(section => {
        const colorClass = getSectionColorClass(section.color);
        return (
          <div key={section.id} className="pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
            <div className="flex items-center mb-6">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 ${colorClass.icon}`}>
                {section.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-3 tracking-tight">
                {section.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6">
              {section.fields.map(field => {
                if (!field.isVisible) return null;
                const rendered = renderField(field);
                return rendered ? (
                  <div key={field.fieldName} className="w-full">
                    {rendered}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        );
      })}

      <div className="pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-blue-600 dark:text-blue-400">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-3 tracking-tight">
            Select Products
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="w-full">
            <EnhancedSelectField
              placeholder="Search and select products..."
              options={products
                .filter(p => !formState.form.products?.some(sp => sp.productId === p.id))
                .map(p => ({
                  value: p.id,
                  label: `${p.name} - ${p.currency} ${p.price}`,
                  description: p.sku || 'No SKU'
                }))}
              onChange={handleAddProductById}
              leftIcon={<Package className="h-4 w-4 text-gray-400" />}
            />
          </div>
        </div>

        {formState.form.products && formState.form.products.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
              Selected Products ({formState.form.products.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {formState.form.products.map((p, idx) => (
                <div
                  key={`${p.productId}-${idx}`}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {p.quantity} | {p.price}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Value</span>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formState.form.currency} {formState.form.products.reduce((acc, p) => acc + (Number(p.price) * (p.quantity || 1)), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => { setFormState({ ...formState, form: { ...defaultState } }); }}
          className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={formState.isSubmitting || submitting}
          className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          {formState.isSubmitting || submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
