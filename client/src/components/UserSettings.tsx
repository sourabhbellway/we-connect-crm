import React, { useEffect, useState } from "react";
import { Plus, Wrench } from "lucide-react";
import FormModal from "./FormModal";
import BackButton from "./BackButton";
import FieldConfigTable, { FieldDef, FieldType } from "./FieldConfigTable";
import { toast } from "react-toastify";

// Use the generic FieldDef from FieldConfigTable
type UserFieldDef = FieldDef;

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
  if (!v) return undefined;
  if (!NAME_REGEX.test(v))
    return "Only letters, numbers, spaces, hyphen (-) and underscore (_) allowed";
  return undefined;
};

const US_FIELDS_KEY = "user_form_fields";
const loadFields = (): UserFieldDef[] => {
  try {
    const raw = localStorage.getItem(US_FIELDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveFields = (fields: UserFieldDef[]) => {
  try {
    localStorage.setItem(US_FIELDS_KEY, JSON.stringify(fields));
  } catch {}
};


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

const UserSettings: React.FC = () => {
  const [userFields, setUserFields] = useState<UserFieldDef[]>([]);
  const [fieldModal, setFieldModal] = useState<{ open: boolean; editing: UserFieldDef | null }>({ open: false, editing: null });
  const [modalType, setModalType] = useState<FieldType>("TEXT");

  const openNewField = () => setFieldModal({ open: true, editing: null });
  const openEditField = (f: UserFieldDef) => setFieldModal({ open: true, editing: f });

  const seedDefaults = () => {
    const now = Date.now();
    const defaults: UserFieldDef[] = [
      { id: now - 1300, name: "First Name", key: "first_name", type: "TEXT", canBeTurnedOff: false, required: true, description: "User's first name", isActive: true, isDefault: true },
      { id: now - 1200, name: "Last Name", key: "last_name", type: "TEXT", canBeTurnedOff: false, required: true, description: "User's last name", isActive: true, isDefault: true },
      { id: now - 1100, name: "Email", key: "email", type: "EMAIL", canBeTurnedOff: false, required: true, description: "Work email", isActive: true, isDefault: true },
      { id: now - 1000, name: "Phone Number", key: "phone", type: "PHONE", canBeTurnedOff: true, required: false, description: "Work or mobile number", isActive: true, isDefault: true },
      { id: now - 900, name: "Role", key: "role_id", type: "DROPDOWN", canBeTurnedOff: true, required: true, description: "User's role", isActive: true, isDefault: true, optionsSource: "roles" },
      { id: now - 800, name: "Department", key: "department_id", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "Department", isActive: true, isDefault: true, options: [], optionsSource: "manual" },
      { id: now - 700, name: "Manager", key: "manager_id", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "Reporting manager", isActive: true, isDefault: true, optionsSource: "users" },
      { id: now - 600, name: "Status", key: "status", type: "DROPDOWN", canBeTurnedOff: true, required: true, description: "Active / Inactive", isActive: true, isDefault: true, options: ["Active", "Inactive"], optionsSource: "manual" },
      { id: now - 500, name: "Created Date", key: "created_at", type: "DATE", canBeTurnedOff: false, required: true, description: "Account creation date", isActive: true, isDefault: true },
      { id: now - 400, name: "Last Login", key: "last_login_at", type: "DATE", canBeTurnedOff: true, required: false, description: "Timestamp of last login", isActive: true, isDefault: true },
      { id: now - 300, name: "Location / Time Zone", key: "time_zone", type: "DROPDOWN", canBeTurnedOff: true, required: false, description: "For routing and availability", isActive: true, isDefault: true, options: [], optionsSource: "manual" },
      { id: now - 200, name: "Profile Picture", key: "profile_picture", type: "IMAGE", canBeTurnedOff: true, required: false, description: "Avatar or profile image", isActive: true, isDefault: true },
    ];
    saveFields(defaults);
    setUserFields(defaults);
  };

  useEffect(() => {
    const existing = loadFields();
    if (!existing || existing.length === 0) {
      seedDefaults();
    } else {
      // enforce non-turn-off remain active
      setUserFields(existing.map((f) => (!f.canBeTurnedOff ? { ...f, isActive: true } : f)));
    }
  }, []);

  useEffect(() => {
    if (fieldModal.open) setModalType(fieldModal.editing?.type || "TEXT");
  }, [fieldModal]);

  const saveField = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Partial<UserFieldDef> = {
      id: fieldModal.editing?.id,
      name: String(fd.get("name") || "").trim(),
      key: String(fd.get("key") || "").trim(),
      type: String(fd.get("type") || "TEXT") as FieldType,
      canBeTurnedOff: Boolean(fd.get("canBeTurnedOff")),
      required: Boolean(fd.get("required")),
      description: String(fd.get("description") || "").trim() || undefined,
      options: (() => {
        const raw = String(fd.get("options") || "").trim();
        if (!raw) return undefined;
        return raw.split(/\n|,/).map((s) => s.trim()).filter((s) => s.length > 0);
      })(),
      optionsSource: ((): "manual" | "roles" | "users" | undefined => {
        const src = String(fd.get("optionsSource") || "manual");
        if (src === "roles" || src === "users") return src as any;
        return "manual";
      })(),
      isActive: Boolean(fd.get("isActive")),
      isDefault: fieldModal.editing?.isDefault ?? false,
    };
    const nameErr = validateName(payload.name || "");
    const descErr = validateDescription(payload.description);
    if (nameErr || descErr) {
      toast.error(nameErr || descErr);
      return;
    }
    if (!payload.key) payload.key = (payload.name as string).toLowerCase().replace(/\s+/g, "_");

    setUserFields((prev) => {
      let next: UserFieldDef[];
      if (payload.id) {
        next = prev.map((x) =>
          x.id === payload.id
            ? ({ ...(x as any), ...payload, options: payload.type === "DROPDOWN" || payload.type === "MULTI_SELECT" ? payload.options ?? x.options : undefined } as UserFieldDef)
            : x
        );
      } else {
        const newField: UserFieldDef = {
          id: Date.now(),
          name: payload.name as string,
          key: payload.key as string,
          type: (payload.type as FieldType) || "TEXT",
          canBeTurnedOff: Boolean(payload.canBeTurnedOff),
          required: Boolean(payload.required),
          description: payload.description,
          options: payload.type === "DROPDOWN" || payload.type === "MULTI_SELECT" ? payload.options : undefined,
          optionsSource: payload.type === "DROPDOWN" || payload.type === "MULTI_SELECT" ? payload.optionsSource || "manual" : undefined,
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
    setUserFields((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFields(next);
      return next;
    });
    toast.success("Field deleted");
  };

  const toggleFieldActive = (f: UserFieldDef, v: boolean) => {
    if (!f.canBeTurnedOff && !v) {
      toast.info("This field cannot be turned off");
      return;
    }
    setUserFields((prev) => {
      const next = prev.map((x) => (x.id === f.id ? { ...x, isActive: v } : x));
      saveFields(next);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 opacity-20 blur-3xl pointer-events-none" />
      </div>
      <div className="relative px-6 py-6">
        <div className=" mx-auto">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-10 -top-10 md:right-0 md:-top-8 aspect-square opacity-10 dark:opacity-10">
            <div className="relative w-[220px] h-[220px] md:w-[300px] md:h-[300px] rotate-12">
              <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-blue-400/40 via-blue-400/30 to-blue-400/30 rounded-full"></div>
              <div className="absolute inset-6 rounded-3xl border-2 border-white/40 dark:border-white/10"></div>
            </div>
          </div>

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Configure the user form fields for your team
              </p>
            </div>
            <BackButton to="/settings" />
          </div>

      

          {/* User Form Configuration */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-5 my-6">
            <SectionHeader
              icon={<Wrench className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
              title="User Form Configuration"
              action={
                <button
                  onClick={openNewField}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </button>
              }
            />

            <FieldConfigTable
              fields={userFields}
              onEdit={openEditField}
              onDelete={removeField}
              onToggleActive={toggleFieldActive}
              showOptionsSource={true}
            />
          </div>

          {/* Field Modal */}
          <FormModal
            open={fieldModal.open}
            title={fieldModal.editing ? "Edit Field" : "Add Field"}
            onClose={() => setFieldModal({ open: false, editing: null })}
            onSubmit={(e) => saveField(e as unknown as React.FormEvent<HTMLFormElement>)}
            submitText={fieldModal.editing ? "Update" : "Create"}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Field Name</label>
                  <input
                    name="name"
                    defaultValue={fieldModal.editing?.name || ""}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
                  <input
                    name="key"
                    defaultValue={fieldModal.editing?.key || ""}
                    placeholder="first_name"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    name="type"
                    defaultValue={fieldModal.editing?.type || "TEXT"}
                    onChange={(e) => setModalType(e.target.value as FieldType)}
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
                    <option value="IMAGE">Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    name="description"
                    defaultValue={fieldModal.editing?.description || ""}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" name="required" defaultChecked={fieldModal.editing?.required ?? false} className="mr-2" />
                  Required
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" name="canBeTurnedOff" defaultChecked={fieldModal.editing?.canBeTurnedOff ?? true} className="mr-2" />
                  Can be turned off
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" name="isActive" defaultChecked={fieldModal.editing?.isActive ?? true} className="mr-2" />
                  Active
                </label>
              </div>

              {(modalType === "DROPDOWN" || modalType === "MULTI_SELECT") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Options Source</label>
                    <select
                      name="optionsSource"
                      defaultValue={fieldModal.editing?.optionsSource || "manual"}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="manual">Manual list</option>
                      <option value="roles">Use Roles</option>
                      <option value="users">Use Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Options (comma or newline separated)</label>
                    <textarea
                      name="options"
                      defaultValue={(fieldModal.editing?.options || []).join("\n")}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder={`e.g.\nActive\nInactive`}
                    />
                  </div>
                </div>
              )}
            </div>
          </FormModal>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;


