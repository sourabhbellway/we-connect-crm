import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Tags,
  Database,
  Wrench,
} from "lucide-react";
import { tagService, Tag } from "../services/tagService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { useAuth } from "../contexts/AuthContext";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";
import FormModal from "./FormModal";
import ColorPalette from "./ColorPalette";
import InputField, { TextAreaField } from "./InputField";
import FieldConfigTable, { FieldDef, FieldType } from "./FieldConfigTable";
import { toast } from "react-toastify";
import BackButton from "./BackButton";

import LeadFieldsSettings from "./LeadFieldsSettings";
// Allow only letters, numbers, spaces, hyphen and underscore
const NAME_REGEX = /^[A-Za-z0-9 _-]+$/;
const validateName = (value: string): string | undefined => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "Name is required";
  if (!NAME_REGEX.test(trimmed))
    return "Only letters, numbers, spaces, hyphen (-) and underscore (_) allowed";
  return undefined;
};

const validateDescription = (value?: string): string | undefined => {
  const v = (value || "").trim();
  if (!v) return undefined; // optional field
  if (!NAME_REGEX.test(v))
    return "Only letters, numbers, spaces, hyphen (-) and underscore (_) allowed";
  return undefined;
};

// Use the generic FieldDef from FieldConfigTable
type LeadFieldDef = FieldDef;

const LS_FIELDS_KEY = "lead_form_fields";
const loadFields = (): LeadFieldDef[] => {
  try {
    const raw = localStorage.getItem(LS_FIELDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveFields = (fields: LeadFieldDef[]) => {
  try {
    localStorage.setItem(LS_FIELDS_KEY, JSON.stringify(fields));
  } catch {}
};

const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
    <p className="text-sm font-medium">{title}</p>
    {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-2">
      {icon}
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
    </div>
    {action}
  </div>
);

const LeadSettings: React.FC = () => {
  const { hasPermission } = useAuth();
  const { leadSources: contextLeadSources } = useBusinessSettings();
  const [tags, setTags] = useState<Tag[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadFields, setLeadFields] = useState<LeadFieldDef[]>([]);

  const canManageLeads = useMemo(
    () => ({
      read: hasPermission("lead.read"),
      create: hasPermission("lead.create"),
      update: hasPermission("lead.update"),
      delete: hasPermission("lead.delete"),
    }),
    [hasPermission]
  );

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tagsRes, srcRes] = await Promise.all([
        tagService.getTags(),
        leadSourceService.getLeadSources(),
      ]);
      // API returns wrapped data in backend; client services currently return response.data directly.
      // Normalize to arrays if wrapped
      const tagsData =
        (tagsRes as any)?.data?.tags ?? (tagsRes as any)?.tags ?? tagsRes;
      const srcData =
        (srcRes as any)?.data?.leadSources ??
        (srcRes as any)?.leadSources ??
        (srcRes as any)?.data ??
        srcRes;
      
      // Ensure we always set an array
      setTags(Array.isArray(tagsData) ? tagsData : []);
      // Use context leadSources if available, otherwise use API response
      const finalLeadSources = Array.isArray(contextLeadSources) && contextLeadSources.length > 0
        ? contextLeadSources
        : (Array.isArray(srcData) ? srcData : []);
      setLeadSources(finalLeadSources);
      // Load lead form fields (UI-only, from localStorage). If empty, seed with sample defaults
      const existing = loadFields();
      if (!existing || existing.length === 0) {
        const now = Date.now();
        const sampleDefaults: LeadFieldDef[] = [
          {
            id: now - 1900,
            name: "First Name",
            key: "first_name",
            type: "TEXT",
            canBeTurnedOff: false,
            required: true,
            description: "Lead's first name",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1800,
            name: "Last Name",
            key: "last_name",
            type: "TEXT",
            canBeTurnedOff: false,
            required: true,
            description: "Lead's last name",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1700,
            name: "Email",
            key: "email",
            type: "EMAIL",
            canBeTurnedOff: true,
            required: false,
            description: "Primary email address",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1600,
            name: "Phone Number",
            key: "phone",
            type: "PHONE",
            canBeTurnedOff: true,
            required: false,
            description: "Lead's phone number",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1500,
            name: "Company Name",
            key: "company",
            type: "TEXT",
            canBeTurnedOff: true,
            required: false,
            description: "Name of lead's company",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1400,
            name: "Job Title",
            key: "job_title",
            type: "TEXT",
            canBeTurnedOff: true,
            required: false,
            description: "Role of the lead in their company",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1300,
            name: "Lead Source",
            key: "source_id",
            type: "DROPDOWN",
            canBeTurnedOff: true,
            required: false,
            description: "Origin of the lead (Website, Referral, Ad, etc.)",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1200,
            name: "Industry",
            key: "industry",
            type: "DROPDOWN",
            canBeTurnedOff: true,
            required: false,
            description: "Industry the lead belongs to",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1100,
            name: "Lead Status",
            key: "status",
            type: "DROPDOWN",
            canBeTurnedOff: false,
            required: true,
            description: "Pipeline stage (New, Contacted, Qualified, etc.)",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 1000,
            name: "Rating",
            key: "rating",
            type: "DROPDOWN",
            canBeTurnedOff: true,
            required: false,
            description: "Lead quality (Hot, Warm, Cold)",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 900,
            name: "Owner",
            key: "owner_id",
            type: "DROPDOWN",
            canBeTurnedOff: false,
            required: true,
            description: "CRM user assigned to this lead",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 800,
            name: "Created Date",
            key: "created_at",
            type: "DATE",
            canBeTurnedOff: false,
            required: true,
            description: "Auto-generated creation timestamp",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 700,
            name: "Last Contacted Date",
            key: "last_contacted_at",
            type: "DATE",
            canBeTurnedOff: true,
            required: false,
            description: "Last time the lead was contacted",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 600,
            name: "Notes",
            key: "notes",
            type: "TEXT",
            canBeTurnedOff: true,
            required: false,
            description: "Additional notes about the lead",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 500,
            name: "Tags",
            key: "tags",
            type: "MULTI_SELECT",
            canBeTurnedOff: true,
            required: false,
            description: "Tags to segment leads",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 400,
            name: "Website",
            key: "website",
            type: "TEXT",
            canBeTurnedOff: true,
            required: false,
            description: "Lead/company website URL",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 300,
            name: "Location / Address",
            key: "address",
            type: "TEXT",
            canBeTurnedOff: true,
            required: false,
            description: "Lead's address or location",
            isActive: true,
            isDefault: true,
          },
          {
            id: now - 200,
            name: "Time Zone",
            key: "time_zone",
            type: "DROPDOWN",
            canBeTurnedOff: true,
            required: false,
            description: "List of all time zones for scheduling",
            isActive: true,
            isDefault: true,
          },
          
        ];
        saveFields(sampleDefaults);
        setLeadFields(sampleDefaults);
      } else {
        // Build canonical default set (18 fields)
        const baseline: Omit<LeadFieldDef, "id">[] = [
          { name: "First Name", key: "first_name", type: "TEXT", canBeTurnedOff: false, required: true, description: "Lead's first name", isActive: true, isDefault: true },
          { name: "Last Name", key: "last_name", type: "TEXT", canBeTurnedOff: false, required: true, description: "Lead's last name", isActive: true, isDefault: true },
          { name: "Email", key: "email", type: "EMAIL", canBeTurnedOff: true, required: false, description: "Primary email address", isActive: true, isDefault: true },
          { name: "Phone Number", key: "phone", type: "PHONE", canBeTurnedOff: true, required: false, description: "Lead's phone number", isActive: true, isDefault: true },
          { name: "Company Name", key: "company", type: "TEXT", canBeTurnedOff: true, required: false, description: "Name of lead's company", isActive: true, isDefault: true },
          { name: "Job Title", key: "job_title", type: "TEXT", canBeTurnedOff: true, required: false, description: "Role of the lead in their company", isActive: true, isDefault: true },
          { name: "Lead Source", key: "source_id", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "Origin of the lead", isActive: true, isDefault: true },
          { name: "Industry", key: "industry", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "Industry the lead belongs to", isActive: true, isDefault: true },
          { name: "Lead Status", key: "status", type: "DROPDOWN", canBeTurnedOff: false, required: true, description: "Pipeline stage", isActive: true, isDefault: true },
          { name: "Rating", key: "rating", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "Lead quality", isActive: true, isDefault: true },
          { name: "Owner", key: "owner_id", type: "DROPDOWN", canBeTurnedOff: false, required: true, description: "Assigned CRM user", isActive: true, isDefault: true },
          { name: "Created Date", key: "created_at", type: "DATE", canBeTurnedOff: false, required: true, description: "Creation timestamp", isActive: true, isDefault: true },
          { name: "Last Contacted Date", key: "last_contacted_at", type: "DATE", canBeTurnedOff: true, required: false, description: "Last contacted time", isActive: true, isDefault: true },
          { name: "Notes", key: "notes", type: "TEXT", canBeTurnedOff: true, required: false, description: "Additional details", isActive: true, isDefault: true },
          { name: "Tags", key: "tags", type: "MULTI_SELECT", canBeTurnedOff: true, required: false, description: "Tags to segment leads", isActive: true, isDefault: true },
          { name: "Website", key: "website", type: "TEXT", canBeTurnedOff: true, required: false, description: "Company website", isActive: true, isDefault: true },
          { name: "Location / Address", key: "address", type: "TEXT", canBeTurnedOff: true, required: false, description: "Lead's address or location", isActive: true, isDefault: true },
          { name: "Time Zone", key: "time_zone", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "For scheduling follow-ups", isActive: true, isDefault: true },
        ];

        // Remove deprecated and merge missing defaults
        const filtered = existing.filter((f: LeadFieldDef) => f.key !== "lead_id" && f.key !== "custom_fields");
        const keySet = new Set(filtered.map((f: LeadFieldDef) => f.key));
        const merged: LeadFieldDef[] = [
          ...filtered,
          ...baseline
            .filter((d) => !keySet.has(d.key))
            .map((d, idx) => ({ id: Date.now() + idx, ...d } as LeadFieldDef)),
        ];

        const normalized = merged.map((f: LeadFieldDef) => (!f.canBeTurnedOff ? { ...f, isActive: true } : f));
        saveFields(normalized);
        setLeadFields(normalized);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageLeads.read) {
      fetchAll();
    }
  }, [canManageLeads.read, contextLeadSources]);

  const upsertTag = async (existing?: Tag) => {
    setTagModal({ open: true, editing: existing || null });
  };

  const removeTag = async (id: number) => {
    if (!canManageLeads.delete) return;
    if (!confirm("Delete this tag?")) return;
    try {
      setLoading(true);
      await tagService.deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tag deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const upsertLeadSource = async (existing?: LeadSource) => {
    setSourceModal({ open: true, editing: existing || null });
  };

  const removeLeadSource = async (id: number) => {
    if (!canManageLeads.delete) return;
    if (!confirm("Delete this lead source?")) return;
    try {
      setLoading(true);
      await leadSourceService.deleteLeadSource(id);
      setLeadSources((prev) => prev.filter((s) => s.id !== id));
      toast.success("Lead source deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Lead form configuration handlers
  const [fieldModal, setFieldModal] = useState<{
    open: boolean;
    editing: LeadFieldDef | null;
  }>({ open: false, editing: null });
  const openNewField = () => setFieldModal({ open: true, editing: null });
  const openEditField = (f: LeadFieldDef) =>
    setFieldModal({ open: true, editing: f });

  const saveField = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Partial<LeadFieldDef> = {
      id: fieldModal.editing?.id,
      name: String(fd.get("name") || "").trim(),
      key: String(fd.get("key") || "").trim(),
      type: String(fd.get("type") || "TEXT") as FieldType,
      canBeTurnedOff: Boolean(fd.get("canBeTurnedOff")),
      required: Boolean(fd.get("required")),
      // options are only relevant for DROPDOWN / MULTI_SELECT
      options: (() => {
        const raw = String(fd.get("options") || "").trim();
        if (!raw) return undefined;
        return raw
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      })(),
      isActive: Boolean(fd.get("isActive")),
      // system default flag is controlled by code, not via form
      isDefault: fieldModal.editing?.isDefault ?? false,
      description: String(fd.get("description") || "").trim() || undefined,
    };
    const nameErr = validateName(payload.name || "");
    const descErr = validateDescription(payload.description);
    if (nameErr || descErr) {
      toast.error(nameErr || descErr);
      return;
    }
    if (!payload.key)
      payload.key = (payload.name as string).toLowerCase().replace(/\s+/g, "_");
    setLeadFields((prev) => {
      let next: LeadFieldDef[];
      if (payload.id) {
        next = prev.map((x) =>
          x.id === payload.id
            ? ({ ...(x as any), ...payload, options: payload.type === "DROPDOWN" || payload.type === "MULTI_SELECT" ? payload.options ?? x.options : undefined } as LeadFieldDef)
            : x
        );
      } else {
        const newField: LeadFieldDef = {
          id: Date.now(),
          name: payload.name as string,
          key: payload.key as string,
          type: (payload.type as FieldType) || "TEXT",
          canBeTurnedOff: Boolean(payload.canBeTurnedOff),
          required: Boolean(payload.required),
          description: payload.description,
          options: payload.type === "DROPDOWN" || payload.type === "MULTI_SELECT" ? payload.options : undefined,
          isActive: payload.isActive ?? true,
          isDefault: Boolean(payload.isDefault),
        };
        next = [...prev, newField];
      }
      saveFields(next);
      return next;
    });
    setFieldModal({ open: false, editing: null });
    toast.success(payload.id ? "Field updated" : "Field created");
  };

  const removeField = (id: number, isDefault: boolean) => {
    if (isDefault) return;
    if (!confirm("Delete this field?")) return;
    setLeadFields((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFields(next);
      return next;
    });
    toast.success("Field deleted");
  };

  const toggleFieldActive = (f: LeadFieldDef, v: boolean) => {
    if (!f.canBeTurnedOff && !v) {
      toast.info("This field cannot be turned off");
      return;
    }
    setLeadFields((prev) => {
      const next = prev.map((x) => (x.id === f.id ? { ...x, isActive: v } : x));
      saveFields(next);
      return next;
    });
  };

  // Modal State
  const [tagModal, setTagModal] = useState<{
    open: boolean;
    editing: Tag | null;
  }>({ open: false, editing: null });
  const [sourceModal, setSourceModal] = useState<{
    open: boolean;
    editing: LeadSource | null;
  }>({ open: false, editing: null });
  const [formState, setFormState] = useState<{
    name: string;
    color?: string;
    description?: string;
  }>({ name: "", color: "#3B82F6", description: "" });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (tagModal.open) {
      setFormState({
        name: tagModal.editing?.name || "",
        color: tagModal.editing?.color || "#3B82F6",
        description: tagModal.editing?.description || "",
      });
      setFieldErrors({});
    } else if (sourceModal.open) {
      setFormState({
        name: sourceModal.editing?.name || "",
        description: sourceModal.editing?.description || "",
      });
      setFieldErrors({});
    } else {
      setFormState({ name: "", color: "#3B82F6", description: "" });
      setFieldErrors({});
    }
  }, [tagModal, sourceModal]);

  const submitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateName(formState.name);
    const descError = validateDescription(formState.description);
    if (nameError || descError) {
      setFieldErrors({ name: nameError, description: descError });
      return;
    }
    try {
      setLoading(true);
      if (tagModal.editing) {
        const updated = await tagService.updateTag(tagModal.editing.id, {
          name: formState.name,
          color: formState.color,
          description: formState.description,
        });
        const payload =
          (updated as any)?.data?.tag ?? (updated as any)?.tag ?? updated;
        setTags((prev) =>
          prev.map((t) =>
            t.id === tagModal.editing!.id ? { ...t, ...payload } : t
          )
        );
        toast.success("Tag updated");
      } else {
        const created = await tagService.createTag({
          name: formState.name,
          color: formState.color,
          description: formState.description,
        });
        const payload =
          (created as any)?.data?.tag ?? (created as any)?.tag ?? created;
        setTags((prev) => [payload, ...prev]);
        toast.success("Tag created");
      }
      setTagModal({ open: false, editing: null });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitSource = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateName(formState.name);
    const descError = validateDescription(formState.description);
    if (nameError || descError) {
      setFieldErrors({ name: nameError, description: descError });
      return;
    }
    try {
      setLoading(true);
      if (sourceModal.editing) {
        const updated = await leadSourceService.updateLeadSource(
          sourceModal.editing.id,
          {
            name: formState.name,
            description: formState.description,
          }
        );
        const payload =
          (updated as any)?.data?.leadSource ??
          (updated as any)?.leadSource ??
          updated;
        setLeadSources((prev) =>
          prev.map((s) =>
            s.id === sourceModal.editing!.id ? { ...s, ...payload } : s
          )
        );
        toast.success("Lead source updated");
      } else {
        const created = await leadSourceService.createLeadSource({
          name: formState.name,
          description: formState.description,
        });
        const payload =
          (created as any)?.data?.leadSource ??
          (created as any)?.leadSource ??
          created;
        setLeadSources((prev) => [payload, ...prev]);
        toast.success("Lead source created");
      }
      setSourceModal({ open: false, editing: null });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-green-500 via-green-500 to-green-500 opacity-20 blur-3xl pointer-events-none" />
      </div>
      <div className="relative px-6 py-6">
        <div className=" mx-auto">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-10 -top-10 md:right-0 md:-top-8 aspect-square opacity-10 dark:opacity-10">
            <div className="relative w-[220px] h-[220px] md:w-[300px] md:h-[300px] rotate-12">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-green-400/40 via-green-400/30 to-green-400/30 rounded-full"></div>
              <div className="absolute inset-6 rounded-3xl border-2 border-white/40 dark:border-white/10"></div>
            </div>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lead Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Organize taxonomy and configure the lead form for your team
              </p>
            </div>
            <BackButton to="/leads" />
          </div>


          {/* Lead Form Configuration */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-5 my-6">
            <SectionHeader
              icon={
                <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              }
              title="Lead Form Configuration"
              action={
                <button
                  onClick={openNewField}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </button>
              }
            />

          {/* Dynamic Lead Form Fields Management */}
          <div className="my-6">
            <LeadFieldsSettings />
          </div>
            <FieldConfigTable
              fields={leadFields}
              onEdit={openEditField}
              onDelete={removeField}
              onToggleActive={toggleFieldActive}
              showOptionsSource={false}
            />
          </div>

          {/* Field Modal */}
          <FormModal
            open={fieldModal.open}
            title={fieldModal.editing ? "Edit Field" : "Add Field"}
            onClose={() => setFieldModal({ open: false, editing: null })}
            onSubmit={(e) =>
              saveField(e as unknown as React.FormEvent<HTMLFormElement>)
            }
            submitText={fieldModal.editing ? "Update" : "Create"}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Field Name
                  </label>
                  <input
                    name="name"
                    defaultValue={fieldModal.editing?.name || ""}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key
                  </label>
                  <input
                    name="key"
                    defaultValue={fieldModal.editing?.key || ""}
                    placeholder="first_name"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    defaultValue={fieldModal.editing?.type || "TEXT"}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="TEXT">Text</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="DROPDOWN">Dropdown</option>
                    <option value="MULTI_SELECT">Multi-select</option>
                    <option value="CHECKBOX">Checkbox</option>
                    <option value="TOGGLE">Toggle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    name="description"
                    defaultValue={fieldModal.editing?.description || ""}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="required"
                    defaultChecked={fieldModal.editing?.required ?? false}
                    className="mr-2"
                  />
                  Required
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="canBeTurnedOff"
                    defaultChecked={fieldModal.editing?.canBeTurnedOff ?? true}
                    className="mr-2"
                  />
                  Can be turned off
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={fieldModal.editing?.isActive ?? true}
                    className="mr-2"
                  />
                  Active
                </label>
                {/* System default flag removed from UI */}
              </div>
              {(fieldModal.editing?.type === "DROPDOWN" || fieldModal.editing?.type === "MULTI_SELECT") && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Options (comma or newline separated)
                  </label>
                  <textarea
                    name="options"
                    defaultValue={(fieldModal.editing?.options || []).join("\n")}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder={`e.g.\nWebsite\nReferral\nAd`}
                  />
                </div>
              )}
            </div>
          </FormModal>
          {error && (
            <div className="mb-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Tags */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-5 my-6">
            <SectionHeader
              icon={
                <Tags className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              }
              title="Tags"
              action={
                canManageLeads.create ? (
                  <button
                    onClick={() => upsertTag()}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Tag
                  </button>
                ) : null
              }
            />

            {tags.length === 0 ? (
              <EmptyState
                title="No tags yet"
                subtitle="Create your first tag"
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start justify-between hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {tag.name}
                        </p>
                      </div>
                      {tag.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tag.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {canManageLeads.update && (
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm dark:text-white"
                          onClick={() => upsertTag(tag)}
                          disabled={loading}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canManageLeads.delete && (
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 shadow-sm"
                          onClick={() => removeTag(tag.id)}
                          disabled={loading}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lead Sources */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-5 my-6">
            <SectionHeader
              icon={
                <Database className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              }
              title="Lead Sources"
              action={
                canManageLeads.create ? (
                  <button
                    onClick={() => upsertLeadSource()}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Source
                  </button>
                ) : null
              }
            />

            {!Array.isArray(leadSources) || leadSources.length === 0 ? (
              <EmptyState
                title="No lead sources yet"
                subtitle="Create your first source"
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {leadSources.map((src) => (
                  <div
                    key={src.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start justify-between hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {src.name}
                      </p>
                      {src.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {src.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {canManageLeads.update && (
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm dark:text-white"
                          onClick={() => upsertLeadSource(src)}
                          disabled={loading}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canManageLeads.delete && (
                        <button
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 shadow-sm"
                          onClick={() => removeLeadSource(src.id)}
                          disabled={loading}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Tag Modal */}
          <FormModal
            open={tagModal.open}
            title={tagModal.editing ? "Edit Tag" : "New Tag"}
            onClose={() => setTagModal({ open: false, editing: null })}
            onSubmit={submitTag}
            disabled={loading}
            submitText={tagModal.editing ? "Update" : "Create"}
          >
            <div className="space-y-3">
              <InputField
                label="Name"
                value={formState.name}
                onChange={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  setFormState((s) => ({ ...s, name: value }));
                  const err = validateName(value);
                  setFieldErrors((prev) => ({ ...prev, name: err }));
                }}
                placeholder="e.g. VIP"
                required
                error={fieldErrors.name}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <ColorPalette
                  value={formState.color}
                  onChange={(c) => setFormState((s) => ({ ...s, color: c }))}
                />
              </div>
              <TextAreaField
                label="Description"
                value={formState.description}
                onChange={(e) => {
                  const value = (e.target as HTMLTextAreaElement).value;
                  setFormState((s) => ({ ...s, description: value }));
                  const err = validateDescription(value);
                  setFieldErrors((prev) => ({ ...prev, description: err }));
                }}
                placeholder="Optional"
                rows={3}
                error={fieldErrors.description}
              />
            </div>
          </FormModal>

          {/* Lead Source Modal */}
          <FormModal
            open={sourceModal.open}
            title={sourceModal.editing ? "Edit Lead Source" : "New Lead Source"}
            onClose={() => setSourceModal({ open: false, editing: null })}
            onSubmit={submitSource}
            disabled={loading}
            submitText={sourceModal.editing ? "Update" : "Create"}
          >
            <div className="space-y-3">
              <InputField
                label="Name"
                value={formState.name}
                onChange={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  setFormState((s) => ({ ...s, name: value }));
                  const err = validateName(value);
                  setFieldErrors((prev) => ({ ...prev, name: err }));
                }}
                placeholder="e.g. Website"
                required
                error={fieldErrors.name}
              />
              <TextAreaField
                label="Description"
                value={formState.description}
                onChange={(e) => {
                  const value = (e.target as HTMLTextAreaElement).value;
                  setFormState((s) => ({ ...s, description: value }));
                  const err = validateDescription(value);
                  setFieldErrors((prev) => ({ ...prev, description: err }));
                }}
                placeholder="Optional"
                rows={3}
                error={fieldErrors.description}
              />
            </div>
          </FormModal>
        </div>
      </div>
    </div>
  );
};

export default LeadSettings;
