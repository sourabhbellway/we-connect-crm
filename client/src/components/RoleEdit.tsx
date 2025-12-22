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

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

const RoleEdit: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<RoleFormData | undefined>();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<RoleFormData | null>(null);
  const [affectedUsers, setAffectedUsers] = useState<User[]>([]);

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
      // Fetch affected users before showing the confirmation dialog
      try {
        const response = await roleService.getUsersByRole(Number(id));
        if (response.success) {
          setAffectedUsers(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching affected users:", error);
        setAffectedUsers([]);
      }
      
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

      // If role was deactivated and there are affected users, notify them to logout
      if (data.isActive === false && response.affectedUserIds && response.affectedUserIds.length > 0) {
        try {
          // Send logout notification to all affected users via localStorage event
          // This will trigger logout on their sessions if they're still logged in
          const logoutEvent = new CustomEvent('roleDeactivated', {
            detail: {
              userIds: response.affectedUserIds,
              roleName: initialData?.name,
              timestamp: new Date().toISOString(),
            }
          });
          window.dispatchEvent(logoutEvent);

          // Store in session storage so it can be picked up by other tabs
          sessionStorage.setItem('role_deactivation_event', JSON.stringify({
            userIds: response.affectedUserIds,
            roleName: initialData?.name,
            timestamp: new Date().toISOString(),
          }));

          toast.info(`${response.affectedUserIds.length} user(s) will be logged out automatically`);
        } catch (error) {
          console.error('Error notifying users of logout:', error);
        }
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              ⚠️ Warning
            </h3>

            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-600 rounded-lg">
              <p className="text-red-900 dark:text-red-200 font-semibold text-center text-lg">
                {affectedUsers.length} User{affectedUsers.length !== 1 ? 's' : ''} will be Deactivated
              </p>
            </div>

            {affectedUsers.length > 0 && (
              <div className="mb-6 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">These users will not be able to login:</p>
                <ul className="space-y-2">
                  {affectedUsers.map((user) => (
                    <li key={user.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({user.email})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> These users won't be able to access the system until you reactivate the role.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDeactivateConfirm(false);
                  submitToServer(pendingFormData!);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}


    </>


  );
};

export default RoleEdit;
