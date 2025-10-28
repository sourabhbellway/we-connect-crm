import React, { useEffect, useState } from "react";
import InputField, { TextAreaField, SelectField } from "./InputField";
import { EnhancedSelectField } from "./EnhancedSelectField";
import { PhoneInputField } from "./PhoneInputField";
import { LeadPayload } from "../services/leadService";
import { userService } from "../services/userService";
// Lead sources now come from BusinessSettingsContext
import { tagService, Tag } from "../services/tagService";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";
import {
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Briefcase as BriefcaseIcon,
  ListFilter,
  UserCheck,
  AlertCircle,
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
  currency: "USD",
  priority: "medium",
  website: "",
  address: "",
  industry: "",
  companySize: undefined,
  annualRevenue: undefined,
  leadScore: undefined,
  country: "",
  state: "",
  city: "",
  zipCode: "",
  linkedinProfile: "",
  timezone: "",
  preferredContactMethod: "email",
  lastContactedAt: undefined,
  nextFollowUpAt: undefined,
};

const LeadForm: React.FC<LeadFormProps> = ({
  initial,
  onSubmit,
  submitting,
  skipInternalLoadingUI = false,
}) => {
  const { currencySettings, isLoading: businessSettingsLoading } = useBusinessSettings();
  const [formState, setFormState] = useState<FormState>({
    form: {
      ...defaultState,
      currency: currencySettings?.primary || "USD",
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
  const [loading, setLoading] = useState(true);

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
      { value: "CHF", label: "CHF (₣)", description: "Swiss Franc", symbol: "₣" },
      { value: "KRW", label: "KRW (₩)", description: "South Korean Won", symbol: "₩" },
      { value: "MXN", label: "MXN ($)", description: "Mexican Peso", symbol: "$" },
      { value: "BRL", label: "BRL (R$)", description: "Brazilian Real", symbol: "R$" },
      { value: "RUB", label: "RUB (₽)", description: "Russian Ruble", symbol: "₽" },
      { value: "ZAR", label: "ZAR (R)", description: "South African Rand", symbol: "R" },
      { value: "TRY", label: "TRY (₺)", description: "Turkish Lira", symbol: "₺" },
      { value: "NOK", label: "NOK (kr)", description: "Norwegian Krone", symbol: "kr" },
      { value: "SEK", label: "SEK (kr)", description: "Swedish Krona", symbol: "kr" },
      { value: "DKK", label: "DKK (kr)", description: "Danish Krone", symbol: "kr" },
      { value: "PLN", label: "PLN (zł)", description: "Polish Zloty", symbol: "zł" },
      { value: "CZK", label: "CZK (Kč)", description: "Czech Koruna", symbol: "Kč" },
      { value: "HUF", label: "HUF (Ft)", description: "Hungarian Forint", symbol: "Ft" },
      { value: "ILS", label: "ILS (₪)", description: "Israeli Shekel", symbol: "₪" },
      { value: "AED", label: "AED (د.إ)", description: "UAE Dirham", symbol: "د.إ" },
      { value: "SAR", label: "SAR (﷼)", description: "Saudi Riyal", symbol: "﷼" },
      { value: "THB", label: "THB (฿)", description: "Thai Baht", symbol: "฿" },
      { value: "MYR", label: "MYR (RM)", description: "Malaysian Ringgit", symbol: "RM" },
      { value: "IDR", label: "IDR (Rp)", description: "Indonesian Rupiah", symbol: "Rp" },
      { value: "PHP", label: "PHP (₱)", description: "Philippine Peso", symbol: "₱" },
      { value: "VND", label: "VND (₫)", description: "Vietnamese Dong", symbol: "₫" }
    ];

    // Sort currencies with default currency first, then alphabetically
    const defaultCurrency = currencySettings?.primary || "USD";
    return commonCurrencies.sort((a, b) => {
      if (a.value === defaultCurrency) return -1;
      if (b.value === defaultCurrency) return 1;
      return a.label.localeCompare(b.label);
    });
  };

  // Get currency symbol by currency code
  const getCurrencySymbol = (currencyCode: string): string => {
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
      "VND": "₫"
    };
    
    return currencyMap[currencyCode] || currencyCode;
  };

  useEffect(() => {
    if (initial) {
      setFormState((prev) => ({
        ...prev,
        form: { 
          ...defaultState, 
          currency: currencySettings?.primary || "USD",
          ...initial 
        },
      }));
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersRes, tagsRes] = await Promise.all([
          userService.getUsers(),
          tagService.getTags(),
        ]);

        // Handle different API response structures - normalize to arrays
        const usersData =
          (usersRes as any)?.data?.users ??
          (usersRes as any)?.users ??
          usersRes;
        // Lead sources now managed via BusinessSettingsContext (settingsLeadSources)
        const sourcesData = settingsLeadSources;
        const tagsData =
          (tagsRes as any)?.data?.tags ?? (tagsRes as any)?.tags ?? tagsRes;

        setUsers(Array.isArray(usersData) ? usersData : []);
        // No set needed; using settingsLeadSources
        setAllTags(Array.isArray(tagsData) ? tagsData : []);
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
        setLeadSources([]);
        setAllTags([]);

        // Add some sample data for testing if APIs fail
        console.log("Setting fallback empty arrays due to API error");
        // Initialize the lead source select from existing value
        setSelectedLeadSourceId(prev => formState.form.sourceId ?? "");
      } finally {
        setLoading(false);
      }
    };
    load();
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

  const validateName = (value: string, label: string): string | null => {
    const v = (value || "").trim();
    if (!v) return `${label} is required`;
    if (v.length < 3) return `${label} must be at least 3 characters`;
    if (/<[^>]*>/i.test(v)) return "Invalid characters detected";
    if (!/^[A-Za-z\s]+$/.test(v)) return "Only letters and spaces are allowed";
    return null;
  };

  const hasSpecialChars = (value: string): boolean => /[^A-Za-z0-9\s]/.test(value || "");

  // Phone validation: optional, but if provided must be 10-20 digits total
  const validatePhone = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return null; // optional
    const digits = v.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 20) {
      return "Phone number must be between 10 and 20 characters";
    }
    return null;
  };

  // Company and Position validation: 2-100 chars
  const validateCompany = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return "Company is required";
    if (hasSpecialChars(v)) return "Company cannot contain special characters";
    if (v.length < 2) return "Company name must be between 2 and 100 characters";
    if (v.length > 100) return "Company name must be between 2 and 100 characters";
    return null;
  };

  const validatePosition = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return "Position is required";
    if (hasSpecialChars(v)) return "Position cannot contain special characters";
    if (v.length < 2) return "Position must be between 2 and 100 characters";
    if (v.length > 100) return "Position must be between 2 and 100 characters";
    return null;
  };

  const validateNotes = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return null; // notes optional
    if (hasSpecialChars(v)) return "Notes cannot contain special characters";
    return null;
  };



  const validateForm = (formData: LeadPayload): ValidationErrors => {
    const errors: ValidationErrors = {};

    // First/Last name strict validation
    const firstNameError = validateName(formData.firstName || "", "First Name");
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName || "", "Last Name");
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateEmail(formData.email || "");
    if (emailError) errors.email = emailError;

    // Phone
    const phoneError = validatePhone(formData.phone || "");
    if (phoneError) errors.phone = phoneError;

    // Company & Position
    const companyError = validateCompany(formData.company || "");
    if (companyError) errors.company = companyError;

    const positionError = validatePosition(formData.position || "");
    if (positionError) errors.position = positionError;

    // Notes
    const notesError = validateNotes(formData.notes || "");
    if (notesError) errors.notes = notesError;

    return errors;
  };

  const handleChange = (key: keyof LeadPayload, value: any) => {
    setFormState((prev) => {
      const newForm = { ...prev.form, [key]: value };
      const newErrors = { ...prev.errors };

      // Clear error for this field when user starts typing
      if (newErrors[key]) {
        delete newErrors[key];
      }

      // Real-time validation for specific fields
      if (key === "email" && value) {
        const emailError = validateEmail(String(value));
        if (emailError) newErrors.email = emailError;
      }

      if (key === "firstName") {
        const err = validateName(String(value), "First Name");
        if (err) newErrors.firstName = err;
      }

      if (key === "lastName") {
        const err = validateName(String(value), "Last Name");
        if (err) newErrors.lastName = err;
      }

      if (key === "company") {
        const err = validateCompany(String(value));
        if (err) newErrors.company = err;
      }

      if (key === "position") {
        const err = validatePosition(String(value));
        if (err) newErrors.position = err;
      }

      if (key === "notes") {
        const err = validateNotes(String(value));
        if (err) newErrors.notes = err;
      }

      if (key === "phone") {
        // Store value as-is (can be "+<code><number>" or local digits); validate len if present
        newForm.phone = String(value ?? "");

        const phoneValue = String(value ?? "");
        const digits = phoneValue.replace(/\D/g, "");
        if (!phoneValue) {
          delete newErrors.phone; // optional
        } else if (digits.length < 10 || digits.length > 20) {
          newErrors.phone = "Phone number must be between 10 and 20 digits";
        } else {
          delete newErrors.phone;
        }
      }

      if (key === "notes") {
        const notesError = validateNotes(String(value));
        if (notesError) newErrors.notes = notesError;
        else delete newErrors.notes;
      }
      return {
        ...prev,
        form: newForm,
        errors: newErrors,
      };
    });
  };

  const toggleTag = (tagId: number) => {
    setFormState((prev) => {
      const current = prev.form.tags || [];
      const exists = current.includes(tagId);
      return {
        ...prev,
        form: {
          ...prev.form,
          tags: exists
            ? current.filter((id) => id !== tagId)
            : [...current, tagId],
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formState.form);

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({
        ...prev,
        errors,
        hasSubmitted: true,
      }));
      // Do not toast on client-side validation; show inline errors only
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      errors: {},
    }));

    try {
      await onSubmit(formState.form);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Map server-side validation errors to field errors where possible
      const data: any = (error as any)?.response?.data;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const fieldErrors: Record<string, string> = {};
        const messages: string[] = [];
        for (const err of data.errors) {
          const field = err?.path;
          const msg = err?.msg || err?.message;
          if (field && msg) {
            fieldErrors[field] = msg;
            messages.push(msg);
          } else if (msg) {
            messages.push(msg);
          }
        }
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            ...fieldErrors,
            general: messages.join(" | "),
          },
        }));
        // Show combined server validation messages in a toast
        import('react-toastify').then(({ toast }) => {
          const combined = messages.length > 0 ? messages.join("\n") : data?.message || 'Validation errors';
          toast.error(combined, { toastId: 'lead_submit_validation_errors' });
        });
      } else {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            general: data?.message || "Failed to save lead. Please try again.",
          },
        }));
        // Show server message if available
        if (data?.message) {
          import('react-toastify').then(({ toast }) => {
            toast.error(data.message, { toastId: 'lead_submit_error' });
          });
        }
      }
    } finally {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  const showInlineLoading = loading && !skipInternalLoadingUI;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {showInlineLoading && (
          <div className="flex items-center justify-start py-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
            Loading form data...
          </div>
        )}
        {/* General error message */}
        {formState.errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {formState.errors.general}
              </span>
            </div>
          </div>
        )}

        {/* Section 1: Personal Information */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InputField
            label="First Name"
            leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
            error={formState.errors.firstName}
          />
          <InputField
            label="Last Name"
            leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            required
            error={formState.errors.lastName}
          />
          <div className="md:col-span-2 lg:col-span-2">
            <InputField
              label="Email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              type="email"
              value={formState.form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              error={formState.errors.email}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <PhoneInputField
              label="Phone"
              value={formState.form.phone || ""}
              onChange={(value) => handleChange("phone", value)}
              error={formState.errors.phone}
              placeholder="Enter phone number"
            />
          </div>
          </div>
        </div>

        {/* Section 2: Company Information */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <BuildingIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <InputField
            label="Company"
            leftIcon={<BuildingIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
            required
            error={formState.errors.company}
          />
          <InputField
            label="Position/Job Title"
            leftIcon={<BriefcaseIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.position || ""}
            onChange={(e) => handleChange("position", e.target.value)}
            error={formState.errors.position}
          />
          <InputField
            label="Industry"
            leftIcon={<TrendingUp className="h-4 w-4 text-gray-400" />}
            value={formState.form.industry || ""}
            onChange={(e) => handleChange("industry", e.target.value)}
            placeholder="e.g. Technology, Healthcare"
          />
          <InputField
            label="Company Website"
            leftIcon={<Globe className="h-4 w-4 text-gray-400" />}
            type="url"
            value={formState.form.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://company.com"
          />
          <InputField
            label="Company Size"
            leftIcon={<Users className="h-4 w-4 text-gray-400" />}
            type="number"
            value={formState.form.companySize || ""}
            onChange={(e) => handleChange("companySize", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Number of employees"
          />
          <InputField
            label="Annual Revenue"
            leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
            type="number"
            value={formState.form.annualRevenue || ""}
            onChange={(e) => handleChange("annualRevenue", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Annual revenue (USD)"
          />
          </div>
        </div>

        {/* Section 3: Location Information */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location & Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <InputField
            label="Country"
            leftIcon={<Flag className="h-4 w-4 text-gray-400" />}
            value={formState.form.country || ""}
            onChange={(e) => handleChange("country", e.target.value)}
          />
          <InputField
            label="State/Province"
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={formState.form.state || ""}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          <InputField
            label="City"
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={formState.form.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <InputField
            label="ZIP/Postal Code"
            leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
            value={formState.form.zipCode || ""}
            onChange={(e) => handleChange("zipCode", e.target.value)}
          />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <TextAreaField
              label="Address"
              value={formState.form.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="LinkedIn Profile"
              leftIcon={<Linkedin className="h-4 w-4 text-gray-400" />}
              type="url"
              value={formState.form.linkedinProfile || ""}
              onChange={(e) => handleChange("linkedinProfile", e.target.value)}
              placeholder="LinkedIn URL"
            />
            <InputField
              label="Timezone"
              leftIcon={<Clock className="h-4 w-4 text-gray-400" />}
              value={formState.form.timezone || ""}
              onChange={(e) => handleChange("timezone", e.target.value)}
              placeholder="e.g. PST, EST, GMT"
            />
          </div>
          </div>
        </div>

        {/* Section 4: Lead Management */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <Award className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Management</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <EnhancedSelectField
            label="Lead Source"
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
            value={selectedLeadSourceId}
            placeholder="Select source"
            options={[
              { value: "", label: "Select source" },
              ...Array.isArray(settingsLeadSources) ? settingsLeadSources
                .filter((s: any) => s.isActive !== false)
                .sort((a: any,b: any)=> (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((s: any) => ({
                  value: s.id || s.name,
                  label: s.name,
                  description: s.description || undefined
                })) : []
            ]}
            onChange={(value) => {
              setSelectedLeadSourceId(value);
              const n = Number(value);
              handleChange("sourceId", Number.isFinite(n) ? n : undefined);
            }}
            searchable={true}
            clearable={true}
          />
          <EnhancedSelectField
            label="Status"
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
            value={formState.form.status || "new"}
            placeholder="Select status"
            options={[
              { value: "new", label: "New", description: "Newly generated lead" },
              { value: "contacted", label: "Contacted", description: "Initial contact made" },
              { value: "qualified", label: "Qualified", description: "Lead has been qualified" },
              { value: "proposal", label: "Proposal", description: "Proposal sent" },
              { value: "negotiation", label: "Negotiation", description: "In negotiation phase" },
              { value: "closed", label: "Closed", description: "Successfully closed" },
              { value: "lost", label: "Lost", description: "Lead was lost" }
            ]}
            onChange={(value) => handleChange("status", value)}
            searchable={false}
            clearable={false}
          />
          <EnhancedSelectField
            label="Priority"
            leftIcon={<Flag className="h-4 w-4 text-gray-400" />}
            value={formState.form.priority || "medium"}
            placeholder="Select priority"
            options={[
              { value: "low", label: "Low", icon: <span className="text-green-500">●</span>, description: "Low priority" },
              { value: "medium", label: "Medium", icon: <span className="text-yellow-500">●</span>, description: "Medium priority" },
              { value: "high", label: "High", icon: <span className="text-orange-500">●</span>, description: "High priority" },
              { value: "urgent", label: "Urgent", icon: <span className="text-red-500">●</span>, description: "Urgent priority" }
            ]}
            onChange={(value) => handleChange("priority", value)}
            searchable={false}
            clearable={false}
          />
          <EnhancedSelectField
            label="Assigned To"
            leftIcon={<UserCheck className="h-4 w-4 text-gray-400" />}
            value={formState.form.assignedTo ?? ""}
            placeholder="Select user"
            options={[
              { value: "", label: "Select user" },
              ...Array.isArray(users) ? users.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName}`,
                icon: <UserIcon className="h-4 w-4 text-blue-500" />,
                description: `User ID: ${u.id}`
              })) : []
            ]}
            onChange={(value) => handleChange("assignedTo", value ? Number(value) : undefined)}
            searchable={true}
            clearable={true}
          />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Budget
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
                    value={formState.form.budget || ""}
                    onChange={(e) => handleChange("budget", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <EnhancedSelectField
                    value={formState.form.currency || currencySettings?.primary || "USD"}
                    placeholder="Currency"
                    options={getCurrencyOptions()}
                    onChange={(value) => handleChange("currency", value)}
                    searchable
                    clearable={false}
                  />
                </div>
              </div>
            </div>
            <InputField
              label="Lead Score"
              leftIcon={<Award className="h-4 w-4 text-gray-400" />}
              type="number"
              min="0"
              max="100"
              value={formState.form.leadScore || ""}
              onChange={(e) => handleChange("leadScore", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Score (0-100)"
            />
            <EnhancedSelectField
              label="Preferred Contact Method"
              leftIcon={<MessageSquare className="h-4 w-4 text-gray-400" />}
              value={formState.form.preferredContactMethod || "email"}
              placeholder="Select contact method"
              options={[
                { value: "email", label: "Email", icon: <Mail className="h-4 w-4 text-blue-500" />, description: "Contact via email" },
                { value: "phone", label: "Phone", icon: <PhoneIcon className="h-4 w-4 text-green-500" />, description: "Contact via phone call" },
                { value: "sms", label: "SMS", icon: <MessageSquare className="h-4 w-4 text-purple-500" />, description: "Contact via SMS" },
                { value: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-4 w-4 text-green-600" />, description: "Contact via WhatsApp" },
                { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4 text-blue-600" />, description: "Contact via LinkedIn" }
              ]}
              onChange={(value) => handleChange("preferredContactMethod", value)}
              searchable={false}
              clearable={false}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <InputField
              label="Next Follow-up Date"
              leftIcon={<Calendar className="h-4 w-4 text-gray-400" />}
              type="datetime-local"
              value={formState.form.nextFollowUpAt || ""}
              onChange={(e) => handleChange("nextFollowUpAt", e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Notes and Tags Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center mb-6">
            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes & Tags</h3>
          </div>
          
          <div className="space-y-6">
            {/* Notes */}
            <TextAreaField
              label="Notes"
              value={formState.form.notes || ""}
              onChange={(e) =>
                handleChange("notes", (e.target as HTMLTextAreaElement).value)
              }
              error={formState.errors.notes}
              rows={4}
              placeholder="Add any additional notes or comments about this lead..."
            />

            {/* Tags as pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tags
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
                        className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md"
                            : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="submit"
            disabled={formState.isSubmitting || submitting}
            className="inline-flex items-center px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {formState.isSubmitting || submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Lead...
              </>
            ) : (
              <>
                <Award className="h-4 w-4 mr-2" />
                Save Lead
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
