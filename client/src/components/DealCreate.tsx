import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { Button } from "./ui";
import { dealService } from "../services/dealService";
import { toast } from "react-toastify";
import { useBusinessSettings } from "../contexts/BusinessSettingsContext";

const DealCreate: React.FC = () => {
  const navigate = useNavigate();
  const { currencySettings, dealStatuses } = useBusinessSettings();
  const [submitting, setSubmitting] = useState(false);

  // Enforce lead-first creation: redirect to Lead form
  useEffect(() => {
    toast.info("Create a lead first, then convert it to a deal.");
    navigate("/leads/new", { replace: true });
  }, [navigate]);
  const [form, setForm] = useState({
    title: "",
    value: "",
    currency: currencySettings?.primary || "USD",
    status: "DRAFT",
    probability: "50",
    expectedCloseDate: "",
    contactId: "",
    companyId: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        value: form.value ? Number(form.value) : 0,
        currency: form.currency || "USD",
        status: form.status as any,
        probability: form.probability ? Number(form.probability) : 0,
        expectedCloseDate: form.expectedCloseDate || undefined,
        contactId: form.contactId ? Number(form.contactId) : undefined,
        companyId: form.companyId ? Number(form.companyId) : undefined,
      };
      const res = await dealService.createDeal(payload);
      toast.success("Deal created");
      const newId = (res as any)?.data?.id || (res as any)?.data?.deal?.id;
      if (newId) navigate(`/deals/${newId}`);
      else navigate("/deals");
    } catch (e: any) {
      const data = e?.response?.data;
      const message = Array.isArray(data?.errors)
        ? data.errors.map((x: any) => x?.msg || x?.message).filter(Boolean).join("\n")
        : data?.message || e?.message || "Failed to create deal";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Deal</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below</p>
        </div>
        <BackButton to="/deals" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="Deal title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
            <input
              name="value"
              type="number"
              step="0.01"
              value={form.value}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="USD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
            >
              {(dealStatuses || []).filter(s => s.isActive).map(status => (
                <option key={status.id} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Probability (%)</label>
            <input
              name="probability"
              type="number"
              min={0}
              max={100}
              value={form.probability}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Close Date</label>
            <input
              name="expectedCloseDate"
              type="date"
              value={form.expectedCloseDate}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact ID</label>
            <input
              name="contactId"
              type="number"
              value={form.contactId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company ID</label>
            <input
              name="companyId"
              type="number"
              value={form.companyId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-weconnect-red focus:border-weconnect-red dark:bg-gray-700 dark:text-white"
            placeholder="Add details about this deal"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="SECONDARY" onClick={() => navigate("/deals")} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="PRIMARY" disabled={submitting}>
            {submitting ? "Creating..." : "Create Deal"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DealCreate;
