import React, { useEffect, useState } from "react";
import LeadForm from "./LeadForm";
import { leadService, LeadPayload } from "../services/leadService";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

const LeadEdit: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initial, setInitial] = useState<LeadPayload | undefined>();
  const navigate = useNavigate();
  const { id } = useParams();
  const { refreshLeadsCount } = useCounts();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const data = await leadService.getLeadById(Number(id));
        const lead = (data as any)?.data?.lead ?? data?.lead ?? data;
        setInitial({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          position: lead.position,
          sourceId: lead.sourceId,
          status: (lead.status || "new").toLowerCase(),
          notes: lead.notes,
          assignedTo: lead.assignedTo,
          tags: Array.isArray(lead.tags) ? lead.tags.map((t: any) => t.id) : [],
        });
      } catch (e: any) {
        toast.error(e?.message || "Failed to load lead");
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleSubmit = async (data: LeadPayload) => {
    try {
      setSubmitting(true);
      await leadService.updateLead(Number(id), {
        ...data,
        sourceId: data.sourceId ? Number(data.sourceId) : undefined,
        assignedTo: data.assignedTo ? Number(data.assignedTo) : undefined,
      });
      await refreshLeadsCount();
      toast.success("Lead updated");
      navigate("/leads");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Lead
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the details below
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/leads" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
            Loading lead...
          </div>
        ) : (
          <LeadForm
            initial={initial}
            onSubmit={handleSubmit}
            submitting={submitting}
            // Avoid duplicate loaders between parent and form
            skipInternalLoadingUI
          />
        )}
      </div>
    </div>
  );
};

export default LeadEdit;
