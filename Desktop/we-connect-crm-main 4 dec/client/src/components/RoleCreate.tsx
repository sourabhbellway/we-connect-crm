import React, { useState } from "react";
import RoleForm from "./RoleForm";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
  accessScope: 'OWN' | 'GLOBAL';
  isActive?: boolean;
}

const RoleCreate: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshRolesCount } = useCounts();

  const handleSubmit = async (data: RoleFormData) => {
    setSubmitting(true);
  
    const response = await roleService.createRole(data);
  
    // Show backend message based on success
    if (response.success) {
      toast.success(response.message);
      await refreshRolesCount();
      navigate("/roles");
    } else {
      toast.error(response.message);
    }
  
    setSubmitting(false);
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex  items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Role
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to create a new role
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/roles" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <RoleForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default RoleCreate;
