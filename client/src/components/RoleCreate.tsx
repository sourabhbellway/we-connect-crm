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
  isActive?: boolean;
}

const RoleCreate: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshRolesCount } = useCounts();

  const handleSubmit = async (data: RoleFormData) => {
    try {
      setSubmitting(true);
      await roleService.createRole(data);
      await refreshRolesCount();
      toast.success("Role created successfully!");
      navigate("/roles");
    } catch (error: any) {
      console.error("Error creating role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      const existingRole = error.response?.data?.existingRole;

      if (existingRole && !existingRole.isActive) {
        const message = `${errorMessage} Would you like to reactivate the existing role?`;
        toast.error(message);
        // You could add a confirmation dialog here to reactivate the role
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
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
