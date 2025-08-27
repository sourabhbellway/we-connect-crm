import React, { useState } from "react";
import LeadForm from "./LeadForm";
import { leadService, LeadPayload } from "../services/leadService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LeadCreate: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: LeadPayload) => {
    try {
      setSubmitting(true);
      await leadService.createLead({
        ...data,
        // ensure numeric conversions
        sourceId: data.sourceId ? Number(data.sourceId) : undefined,
        assignedTo: data.assignedTo ? Number(data.assignedTo) : undefined,
      });
      toast.success("Lead created");
      navigate("/leads");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Lead</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <LeadForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default LeadCreate;


