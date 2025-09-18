import React, { useEffect, useState } from "react";
import InputField, { TextAreaField, SelectField } from "./InputField";
import { LeadPayload } from "../services/leadService";
import { userService } from "../services/userService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { tagService, Tag } from "../services/tagService";
import {
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Briefcase as BriefcaseIcon,
  ListFilter,
  UserCheck,
  AlertCircle,
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
};

const LeadForm: React.FC<LeadFormProps> = ({
  initial,
  onSubmit,
  submitting,
  skipInternalLoadingUI = false,
}) => {
  const [formState, setFormState] = useState<FormState>({
    form: {
      ...defaultState,
      ...(initial || {}),
    },
    errors: {},
    isSubmitting: false,
    hasSubmitted: false,
  });
  const [users, setUsers] = useState<
    Array<{ id: number; firstName: string; lastName: string }>
  >([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initial) {
      setFormState((prev) => ({
        ...prev,
        form: { ...defaultState, ...initial },
      }));
    }
  }, [initial]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersRes, sourcesRes, tagsRes] = await Promise.all([
          userService.getUsers(),
          leadSourceService.getLeadSources(),
          tagService.getTags(),
        ]);

        // Handle different API response structures - normalize to arrays
        const usersData =
          (usersRes as any)?.data?.users ??
          (usersRes as any)?.users ??
          usersRes;
        const sourcesData =
          (sourcesRes as any)?.data?.leadSources ??
          (sourcesRes as any)?.leadSources ??
          sourcesRes;
        const tagsData =
          (tagsRes as any)?.data?.tags ?? (tagsRes as any)?.tags ?? tagsRes;

        setUsers(Array.isArray(usersData) ? usersData : []);
        setLeadSources(Array.isArray(sourcesData) ? sourcesData : []);
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

  // Phone validation: required, 10-20 characters (matches backend messages)
  const validatePhone = (value: string): string | null => {
    const v = (value || "").trim();
    if (!v) return "Phone number is required";
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
        // Normalize phone to allow digits and an optional leading '+'
        const raw = String(value ?? "");
        
        // Validate phone format
        if (raw && raw.trim()) {
          const phoneRegex = /^\+?[0-9]{10,15}$/;
          if (!phoneRegex.test(raw.replace(/\s/g, ''))) {
            newErrors.phone = "Phone number must be 10-15 digits, optionally starting with +";
          } else {
            delete newErrors.phone;
          }
        } else {
          delete newErrors.phone;
        }
        
        // Clean the phone number
        let cleaned = raw.replace(/[^\d+]/g, "");
        if (cleaned.includes("+")) {
          const hasLeadingPlus = raw.trim().startsWith("+");
          cleaned = cleaned.replace(/\+/g, "");
          cleaned = hasLeadingPlus ? "+" + cleaned : cleaned;
        }
        newForm.phone = cleaned as any;
        const err = validatePhone(cleaned);
        if (err) newErrors.phone = err;
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {showInlineLoading && (
        <div className="flex items-center justify-start py-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
          Loading form data...
        </div>
      )}
      {/* General error message */}
      {formState.errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {formState.errors.general}
            </span>
          </div>
        </div>
      )}

      {/* Fields grid: 1 col (mobile), 3 cols (md), 4 cols (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div>
          <InputField
            label="First Name"
            leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.firstName || ""}
            onChange={(e) =>
              handleChange("firstName", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.firstName}
          />
     
        </div>
        <div>
          <InputField
            label="Last Name"
            leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.lastName || ""}
            onChange={(e) =>
              handleChange("lastName", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.lastName}
          />
        
        </div>
        <div>
          <InputField
            label="Email"
            leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
            type="email"
            value={formState.form.email || ""}
            onChange={(e) =>
              handleChange("email", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.email}
          />
       
        </div>
        <div>
          <InputField
            label="Phone"
            leftIcon={<PhoneIcon className="h-4 w-4 text-gray-400" />}
            type="tel"
            inputMode="numeric"
            value={formState.form.phone || ""}
            onChange={(e) =>
              handleChange("phone", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.phone}
          />
        
        </div>
        <div>
          <InputField
            label="Company"
            leftIcon={<BuildingIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.company || ""}
            onChange={(e) =>
              handleChange("company", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.company}
            placeholder="Enter company name"
          />
        </div>
        <div>
          <InputField
            label="Position"
            leftIcon={<BriefcaseIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.position || ""}
            onChange={(e) =>
              handleChange("position", (e.target as HTMLInputElement).value)
            }
            required
            error={formState.errors.position}
            placeholder="Enter position"
          />
        </div>
        <div>
          <SelectField
            label="Source"
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
            value={formState.form.sourceId ?? ""}
            onChange={(e) =>
              handleChange(
                "sourceId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          >
            <option value="">Select source</option>
            {Array.isArray(leadSources) &&
              leadSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </SelectField>
        </div>
        <div>
          <SelectField
            label="Status"
            leftIcon={<ListFilter className="h-4 w- text-gray-400" />}
            value={formState.form.status || "new"}
            onChange={(e) =>
              handleChange("status", e.target.value as LeadPayload["status"])
            }
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </SelectField>
        </div>
        <div>
          <SelectField
            label="Assigned To"
            leftIcon={<UserCheck className="h-4 w-4 text-gray-400" />}
            value={formState.form.assignedTo ?? ""}
            onChange={(e) =>
              handleChange(
                "assignedTo",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          >
            <option value="">Select user</option>
            {Array.isArray(users) &&
              users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
          </SelectField>
        </div>
      </div>

      {/* Notes */}
      <TextAreaField
        label="Notes"
        value={formState.form.notes || ""}
        onChange={(e) =>
          handleChange("notes", (e.target as HTMLTextAreaElement).value)
        }
        error={formState.errors.notes}
      />

      {/* Tags as pills */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(allTags) &&
            allTags.map((tag) => {
              const selected = (formState.form.tags || []).includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selected
                      ? "bg-sky-500 text-white border-sky-500 hover:bg-sky-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={formState.isSubmitting || submitting}
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
        >
          {formState.isSubmitting || submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Lead"
          )}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
