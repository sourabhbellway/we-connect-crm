import React, { useState } from "react";
import UserForm from "./UserForm";
import { userService } from "../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { useCounts } from "../contexts/CountsContext";

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  // Password is optional; if omitted, backend will auto-generate and email it
  password?: string;
  roleIds: number[];
  isActive?: boolean;
  managerId?: number; // Reporting Authority
}

export interface UserEditPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for edit operations
  roleIds: number[];
  isActive?: boolean;
  managerId?: number; // Reporting Authority
}

const UserCreate: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshUsersCount } = useCounts();

  const handleSubmit = async (data: UserPayload) => {
    try {
      setSubmitting(true);
      if (!data.roleIds || data.roleIds.length === 0) {
        toast.error("Please select at least one role.");
        return;
      }
      // Only send allowed fields to Nest DTO
      const createPayload: any = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roleIds: data.roleIds,
        ...(data.managerId ? { managerId: data.managerId } : {}),
      };

      // If admin explicitly provides a password, send it; otherwise backend will auto-generate
      if (data.password && data.password.trim()) {
        createPayload.password = data.password.trim();
      }
      await userService.createUser(createPayload);

      await refreshUsersCount();
      toast.success("User created successfully!");
      navigate("/users");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create User
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below
          </p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/users" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <UserForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default UserCreate;
