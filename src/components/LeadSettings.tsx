import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Tags, Database } from "lucide-react";
import { tagService, Tag } from "../services/tagService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { useAuth } from "../contexts/AuthContext";
import FormModal from "./FormModal";
import ColorPalette from "./ColorPalette";
import InputField, { TextAreaField } from "./InputField";
import { toast } from "react-toastify";
import BackButton from "./BackButton";

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        srcRes;
      setTags(tagsData || []);
      setLeadSources(srcData || []);
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
  }, [canManageLeads.read]);

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

  useEffect(() => {
    if (tagModal.open) {
      setFormState({
        name: tagModal.editing?.name || "",
        color: tagModal.editing?.color || "#3B82F6",
        description: tagModal.editing?.description || "",
      });
    } else if (sourceModal.open) {
      setFormState({
        name: sourceModal.editing?.name || "",
        description: sourceModal.editing?.description || "",
      });
    } else {
      setFormState({ name: "", color: "#3B82F6", description: "" });
    }
  }, [tagModal, sourceModal]);

  const submitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name?.trim()) return;
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
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const submitSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name?.trim()) return;
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
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex  items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lead Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage tags and lead sources
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/leads" />
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <SectionHeader
          icon={<Tags className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
          title="Tags"
          action={
            canManageLeads.create ? (
              <button
                onClick={() => upsertTag()}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" /> New Tag
              </button>
            ) : null
          }
        />

        {tags.length === 0 ? (
          <EmptyState title="No tags yet" subtitle="Create your first tag" />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-start justify-between"
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
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => upsertTag(tag)}
                      disabled={loading}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canManageLeads.delete && (
                    <button
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <SectionHeader
          icon={
            <Database className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          }
          title="Lead Sources"
          action={
            canManageLeads.create ? (
              <button
                onClick={() => upsertLeadSource()}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" /> New Source
              </button>
            ) : null
          }
        />

        {leadSources.length === 0 ? (
          <EmptyState
            title="No lead sources yet"
            subtitle="Create your first source"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {leadSources.map((src) => (
              <div
                key={src.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-start justify-between"
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
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => upsertLeadSource(src)}
                      disabled={loading}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canManageLeads.delete && (
                    <button
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
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
            onChange={(e) =>
              setFormState((s) => ({
                ...s,
                name: (e.target as HTMLInputElement).value,
              }))
            }
            placeholder="e.g. VIP"
            required
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
            onChange={(e) =>
              setFormState((s) => ({
                ...s,
                description: (e.target as HTMLTextAreaElement).value,
              }))
            }
            placeholder="Optional"
            rows={3}
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
            onChange={(e) =>
              setFormState((s) => ({
                ...s,
                name: (e.target as HTMLInputElement).value,
              }))
            }
            placeholder="e.g. Website"
            required
          />
          <TextAreaField
            label="Description"
            value={formState.description}
            onChange={(e) =>
              setFormState((s) => ({
                ...s,
                description: (e.target as HTMLTextAreaElement).value,
              }))
            }
            placeholder="Optional"
            rows={3}
          />
        </div>
      </FormModal>
    </div>
  );
};

export default LeadSettings;
