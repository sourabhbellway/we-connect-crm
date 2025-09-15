import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Database } from "lucide-react";
import {
  industryService,
  Industry,
  IndustryField,
} from "../services/industryService";
import { useAuth } from "../contexts/AuthContext";
import FormModal from "./FormModal";
import InputField, { TextAreaField } from "./InputField";
import { toast } from "react-toastify";
import BackButton from "./BackButton";

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center">
      <span className="mr-2">{icon}</span>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
        {title}
      </h3>
    </div>
    {action}
  </div>
);

type IndustryModalState = { open: boolean; editing: Industry | null };
type FieldModalState = {
  open: boolean;
  industryId: number | null;
  editing: IndustryField | null;
};

const IndustrySettings: React.FC = () => {
  const { hasRole } = useAuth();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [industryModal, setIndustryModal] = useState<IndustryModalState>({
    open: false,
    editing: null,
  });
  const [fieldModal, setFieldModal] = useState<FieldModalState>({
    open: false,
    industryId: null,
    editing: null,
  });

  const canManage = useMemo(() => ({ admin: hasRole("Admin") }), [hasRole]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await industryService.getIndustries();
      setIndustries(list || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load industries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage.admin) fetchAll();
  }, [canManage.admin]);

  const upsertIndustry = (existing?: Industry) =>
    setIndustryModal({ open: true, editing: existing || null });
  const upsertField = (industryId: number, existing?: IndustryField) =>
    setFieldModal({ open: true, industryId, editing: existing || null });

  const removeIndustry = async (id: number) => {
    if (!confirm("Delete this industry?")) return;
    try {
      setLoading(true);
      await industryService.deleteIndustry(id);
      setIndustries((prev) => prev.filter((i) => i.id !== id));
      toast.success("Industry deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const removeField = async (fieldId: number) => {
    if (!confirm("Delete this field?")) return;
    try {
      setLoading(true);
      await industryService.deleteField(fieldId);
      setIndustries((prev) =>
        prev.map((ind) => ({
          ...ind,
          fields: ind.fields.filter((f) => f.id !== fieldId),
        }))
      );
      toast.success("Field deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const submitIndustry = async (data: any) => {
    try {
      setLoading(true);
      if (industryModal.editing) {
        const updated = await industryService.updateIndustry(
          industryModal.editing.id,
          data
        );
        setIndustries((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        toast.success("Industry updated");
      } else {
        const created = await industryService.createIndustry(data);
        setIndustries((prev) => [created, ...prev]);
        toast.success("Industry created");
      }
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setLoading(false);
      setIndustryModal({ open: false, editing: null });
    }
  };

  const submitField = async (data: any) => {
    if (!fieldModal.industryId) return;
    try {
      setLoading(true);
      if (fieldModal.editing) {
        const updated = await industryService.updateField(
          fieldModal.editing.id,
          data
        );
        setIndustries((prev) =>
          prev.map((ind) => ({
            ...ind,
            fields: ind.fields.map((f) =>
              f.id === updated.id ? (updated as any) : f
            ),
          }))
        );
        toast.success("Field updated");
      } else {
        const created = await industryService.addField(
          fieldModal.industryId,
          data
        );
        setIndustries((prev) =>
          prev.map((ind) =>
            ind.id === fieldModal.industryId
              ? { ...ind, fields: [created, ...ind.fields] }
              : ind
          )
        );
        toast.success("Field added");
      }
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setLoading(false);
      setFieldModal({ open: false, industryId: null, editing: null });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex  items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Industry Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage industries and their fields
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/settings" />
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <SectionHeader
          icon={
            <Database className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          }
          title="Industries"
          action={
            canManage.admin ? (
              <button
                onClick={() => upsertIndustry()}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" /> New Industry
              </button>
            ) : null
          }
        />

        {loading && (
          <div className="py-6 text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        )}

        {!loading && industries.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No industries found
          </div>
        )}

        <div className="space-y-4">
          {industries.map((ind) => (
            <div
              key={ind.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {ind.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ind.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {ind.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {ind.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {ind.description}
                    </p>
                  )}
                </div>
                {canManage.admin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => upsertIndustry(ind)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit industry"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeIndustry(ind.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                      title="Delete industry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => upsertField(ind.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Add field"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="mt-3 grid gap-2">
                {ind.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        {f.name}
                      </span>
                      {(f as any).type && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {(f as any).type}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {f.isRequired ? "Required" : "Optional"}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          f.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {f.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {canManage.admin && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => upsertField(ind.id, f)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeField(f.id)}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {ind.fields.length === 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    No fields yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry modal */}
      <FormModal
        open={industryModal.open}
        onClose={() => setIndustryModal({ open: false, editing: null })}
        title={industryModal.editing ? "Edit Industry" : "New Industry"}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const payload = {
            name: String(fd.get("name") || "").trim(),
            description:
              String(fd.get("description") || "").trim() || undefined,
            isActive: !!fd.get("isActive"),
          };
          submitIndustry(payload);
        }}
      >
        <InputField
          name="name"
          label="Name"
          placeholder="e.g. Healthcare"
          required
          defaultValue={industryModal.editing?.name || ""}
        />
        <TextAreaField
          name="description"
          label="Description"
          placeholder="Optional"
          defaultValue={industryModal.editing?.description || ""}
        />
        <div className="mt-2">
          <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={industryModal.editing?.isActive ?? true}
              className="mr-2"
            />
            Active
          </label>
        </div>
      </FormModal>

      {/* Field modal */}
      <FormModal
        open={fieldModal.open}
        onClose={() =>
          setFieldModal({ open: false, industryId: null, editing: null })
        }
        title={fieldModal.editing ? "Edit Field" : "Add Field"}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const payload = {
            name: String(fd.get("name") || "").trim(),
            type: String(fd.get("type") || "TEXT").toUpperCase(),
            isRequired: !!fd.get("isRequired"),
            isActive: !!fd.get("isActive"),
          } as any;
          submitField(payload);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            name="name"
            label="Field Name"
            placeholder="e.g. Annual Revenue"
            required
            defaultValue={fieldModal.editing?.name || ""}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              name="type"
              defaultValue={(fieldModal.editing as any)?.type || "TEXT"}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            >
              <option value="TEXT">Text</option>
              <option value="NUMBER">Number</option>
              <option value="DATE">Date</option>
              <option value="TIME">Time</option>
              <option value="DROPDOWN">Dropdown</option>
              <option value="MULTI_SELECT">Multi-select Dropdown</option>
              <option value="CHECKBOX">Checkbox</option>
              <option value="TOGGLE">Toggle</option>
              <option value="FILE">File Upload</option>
            </select>
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-4">
          <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isRequired"
              defaultChecked={fieldModal.editing?.isRequired ?? false}
              className="mr-2"
            />
            Required
          </label>
          <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={fieldModal.editing?.isActive ?? true}
              className="mr-2"
            />
            Active
          </label>
        </div>
      </FormModal>
    </div>
  );
};

export default IndustrySettings;
