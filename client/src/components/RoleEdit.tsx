import React, { useEffect, useState } from "react";
import RoleForm from "./RoleForm";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Loader from "./Loader";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
  accessScope: 'OWN' | 'GLOBAL';
  isActive?: boolean;
}

const RoleEdit: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<RoleFormData | undefined>();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { refreshRolesCount } = useCounts();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);

        // First try to get role from location state (passed from Roles.tsx)
        if (location.state?.role) {
          const role = location.state.role;
          setInitialData({
            name: role.name,
            description: role.description || "",
            permissionIds: role.permissions?.map((p: any) => p.id) || [],
            accessScope: role.accessScope || 'OWN',
            isActive: role.isActive,
          });
          setLoading(false);
          return;
        }

        // Fallback: fetch all roles and find the specific one
        const response = await roleService.getRoles();
        const roles = response.data.roles;
        const role = roles.find((r: any) => r.id === Number(id));

        if (!role) {
          toast.error("Role not found");
          navigate("/roles");
          return;
        }

        setInitialData({
          name: role.name,
          description: role.description || "",
          permissionIds: role.permissions?.map((p: any) => p.id) || [],
          accessScope: role.accessScope || 'OWN',
          isActive: role.isActive,
        });
      } catch (error: any) {
        console.error("Error fetching role:", error);
        toast.error("Failed to load role");
        navigate("/roles");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRole();
    }
  }, [id, location.state, navigate]);

  const handleSubmit = async (data: RoleFormData) => {
    try {
      setSubmitting(true);
      await roleService.updateRole(Number(id), data);
      await refreshRolesCount();
      toast.success("Role updated successfully!");
      navigate("/roles");
    } catch (error: any) {
      console.error("Error updating role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex  items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Role
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the role details below
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/roles" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <Loader />
        ) : (
          <RoleForm
            initial={initialData}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default RoleEdit;
