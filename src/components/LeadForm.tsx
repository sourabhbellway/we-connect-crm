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
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      return "Please enter a valid phone number";
    }
    return null;
  };

  const validateRequired = (
    value: string,
    fieldName: string
  ): string | null => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  };

  const validateForm = (formData: LeadPayload): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Required fields
    const firstNameError = validateRequired(
      formData.firstName || "",
      "First Name"
    );
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateRequired(
      formData.lastName || "",
      "Last Name"
    );
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateEmail(formData.email || "");
    if (emailError) errors.email = emailError;

    // Optional fields with specific validation
    const phoneError = validatePhone(formData.phone || "");
    if (phoneError) errors.phone = phoneError;

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
        const emailError = validateEmail(value);
        if (emailError) newErrors.email = emailError;
      }

      if (key === "phone" && value) {
        const phoneError = validatePhone(value);
        if (phoneError) newErrors.phone = phoneError;
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
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: "Failed to save lead. Please try again.",
        },
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Error display component
  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading form...
        </span>
      </div>
    );
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          {formState.errors.firstName && (
            <ErrorMessage error={formState.errors.firstName} />
          )}
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
          {formState.errors.lastName && (
            <ErrorMessage error={formState.errors.lastName} />
          )}
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
          {formState.errors.email && (
            <ErrorMessage error={formState.errors.email} />
          )}
        </div>
        <div>
          <InputField
            label="Phone"
            leftIcon={<PhoneIcon className="h-4 w-4 text-gray-400" />}
            type="tel"
            value={formState.form.phone || ""}
            onChange={(e) =>
              handleChange("phone", (e.target as HTMLInputElement).value)
            }
            error={formState.errors.phone}
          />
          {formState.errors.phone && (
            <ErrorMessage error={formState.errors.phone} />
          )}
        </div>
        <div>
          <InputField
            label="Company"
            leftIcon={<BuildingIcon className="h-4 w-4 text-gray-400" />}
            value={formState.form.company || ""}
            onChange={(e) =>
              handleChange("company", (e.target as HTMLInputElement).value)
            }
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
            leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />}
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
                      ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
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
