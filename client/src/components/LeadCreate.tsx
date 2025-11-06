import React, { useState } from "react";
import LeadForm from "./LeadForm";
import { leadService, LeadPayload } from "../services/leadService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

const LeadCreate: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshLeadsCount } = useCounts();

  const handleSubmit = async (data: LeadPayload) => {
    try {
      setSubmitting(true);
      await leadService.createLead({
        ...data,
        // ensure numeric conversions
        sourceId: data.sourceId ? Number(data.sourceId) : undefined,
        assignedTo: data.assignedTo ? Number(data.assignedTo) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      });
      await refreshLeadsCount();
      toast.success("Lead created");
      navigate("/leads");
    } catch (e: any) {
      const data = e?.response?.data;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const messages: string[] = [];
        for (const err of data.errors) {
          const msg = err?.msg || err?.message;
          if (msg) messages.push(msg);
        }
        toast.error(messages.join("\n") || data?.message || "Validation errors", {
          toastId: "lead_create_validation_errors",
        });
      } else {
        toast.error(data?.message || e?.message || "Create failed", {
          toastId: "lead_create_error",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Lead
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/leads" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <LeadForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default LeadCreate;
