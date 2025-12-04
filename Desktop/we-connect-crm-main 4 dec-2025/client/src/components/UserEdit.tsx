import React, { useState, useEffect } from "react";
import UserForm from "./UserForm";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { UserEditPayload } from "./UserCreate";
import Loader from "./Loader";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

const UserEdit: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<UserEditPayload | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { refreshUsersCount } = useCounts();

  useEffect(() => {
    const getUserData = async () => {
      if (!id) {
        toast.error("User ID not provided");
        navigate("/users");
        return;
      }

      try {
        setLoading(true);

        // Try to get user data from location state first (if navigated from Users page)
        const userFromState = location.state?.user;

        if (userFromState) {
          // Use data from navigation state
          setInitialData({
            firstName: userFromState.firstName,
            lastName: userFromState.lastName,
            email: userFromState.email,
            password: "", // Don't pre-fill password for security
            roleIds: userFromState.roles?.map((role: any) => role.id) || [],
            isActive: userFromState.isActive,
            managerId: userFromState.managerId,
          });
        } else {
          // Fallback: fetch users and find the specific one (support both response shapes)
          const resp = await userService.getUsers();
          const list = (resp?.data?.users ?? resp?.data ?? resp?.users ?? []) as any[];
          const user = Array.isArray(list)
            ? list.find((u: any) => u.id === parseInt(id))
            : null;

          if (!user) {
            toast.error("User not found");
            navigate("/users");
            return;
          }

          setInitialData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: "", // Don't pre-fill password for security
            roleIds: user.roles?.map((role: any) => role.id) || [],
            isActive: user.isActive,
            managerId: user.managerId,
          });
        }
      } catch (error: any) {
        console.error("Error getting user data:", error);
        toast.error("Failed to load user data");
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [id, navigate, location.state]);

  const handleSubmit = async (data: UserEditPayload) => {
    if (!id) return;

    try {
      setSubmitting(true);

      // Whitelist payload to satisfy backend ValidationPipe (forbidNonWhitelisted)
      const updatePayload: any = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive,
        managerId: data.managerId ?? null,
      };
      if (data.password) updatePayload.password = data.password;

      await userService.updateUser(parseInt(id), updatePayload);

      // Sync roles explicitly via dedicated endpoint (replaces existing roles)
      await roleService.assignRoleToUser(parseInt(id), data.roleIds || []);

      await refreshUsersCount();
      toast.success("User updated successfully!");
      navigate("/users");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/users" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/users" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit User
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the user details below
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/users" />
          
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <UserForm<UserEditPayload>
          initial={initialData}
          onSubmit={handleSubmit}
          submitting={submitting}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default UserEdit;
