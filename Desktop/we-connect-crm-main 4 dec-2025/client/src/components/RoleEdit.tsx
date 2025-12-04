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
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<RoleFormData | null>(null);

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
    // If admin tries to deactivate role, ask confirmation
    if (initialData?.isActive === true && data.isActive === false) {
      setPendingFormData(data);
      setShowDeactivateConfirm(true);
      return;
    }

    submitToServer(data);
  };

  const submitToServer = async (data: RoleFormData) => {
    setSubmitting(true);

    const response = await roleService.updateRole(Number(id), data);

    if (response.success) {
      toast.success(response.message);

      if (response.warning) {
        toast.warn(response.warning);
      }

      await refreshRolesCount();
      navigate("/roles");
    } else {
      toast.error(response.message);
    }

    setSubmitting(false);
  };




  return (

    <>
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
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Deactivate Role?
            </h3>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This role is assigned to existing users. They will not be able to log in.
              <br />
              <strong>Change the role of existing users first.</strong>
            </p>

            <div className="flex justify-between items-center mt-4">

              {/* Show Users Button */}
              <button
                onClick={() => navigate(`/users?roleId=${id}`)}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Show Users
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="px-3 py-1.5 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowDeactivateConfirm(false);
                    submitToServer(pendingFormData!);
                  }}
                  className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>


  );
};

export default RoleEdit;
