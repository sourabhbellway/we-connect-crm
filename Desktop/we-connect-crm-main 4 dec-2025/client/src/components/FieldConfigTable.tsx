import React from "react";
import { Edit, Trash2, FileText } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

// Generic field type that works for both User and Lead fields
export type FieldType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "DROPDOWN"
  | "MULTI_SELECT"
  | "CHECKBOX"
  | "TOGGLE"
  | "IMAGE";

export interface FieldDef {
  id: number;
  name: string;
  key: string;
  type: FieldType;
  canBeTurnedOff: boolean;
  required: boolean;
  description?: string;
  options?: string[];
  optionsSource?: "manual" | "roles" | "users";
  isActive: boolean;
  isDefault: boolean;
}

interface FieldConfigTableProps {
  fields: FieldDef[];
  onEdit: (field: FieldDef) => void;
  onDelete: (id: number, isDefault: boolean) => void;
  onToggleActive: (field: FieldDef, value: boolean) => void;
  showOptionsSource?: boolean; // For user fields that have optionsSource
}

const FieldConfigTable: React.FC<FieldConfigTableProps> = ({
  fields,
  onEdit,
  onDelete,
  onToggleActive,
  showOptionsSource = false,
}) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">No fields configured</p>
        <p className="text-xs mt-1">Default and custom fields will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-300">
            <th className="py-2 pr-3">Field</th>
            <th className="py-2 pr-3">Key</th>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3">Options</th>
            <th className="py-2 pr-3">Can Turn Off</th>
            <th className="py-2 pr-3">Required</th>
            <th className="py-2 pr-3">Active</th>
            <th className="py-2 pr-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr
              key={field.id}
              className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors"
            >
              {/* Field Name */}
              <td className="py-2 pr-3">
                <div className="font-medium text-gray-900 dark:text-white flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" /> {field.name}
                </div>
                {field.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </div>
                )}
              </td>

              {/* Key */}
              <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                {field.key}
              </td>

              {/* Type */}
              <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {field.type}
                </span>
              </td>

              {/* Options */}
              <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                {field.type === "DROPDOWN" || field.type === "MULTI_SELECT" ? (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {showOptionsSource && field.optionsSource
                      ? field.optionsSource === "roles"
                        ? "Roles"
                        : field.optionsSource === "users"
                        ? "Users"
                        : `${field.options?.length || 0} values`
                      : `${field.options?.length || 0} values`}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>

              {/* Can Turn Off */}
              <td className="py-2 pr-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    field.canBeTurnedOff
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                  }`}
                >
                  {field.canBeTurnedOff ? "Yes" : "No"}
                </span>
              </td>

              {/* Required */}
              <td className="py-2 pr-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    field.required
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {field.required ? "Yes" : "No"}
                </span>
              </td>

              {/* Active Toggle */}
              <td className="py-2 pr-3">
                <div
                  title={
                    field.canBeTurnedOff ? "" : "This field cannot be turned off"
                  }
                >
                  <ToggleSwitch
                    checked={field.isActive}
                    onChange={(v) => {
                      if (field.canBeTurnedOff) onToggleActive(field, v);
                    }}
                    activeLabel="On"
                    inactiveLabel="Off"
                    className={
                      field.canBeTurnedOff
                        ? ""
                        : "opacity-50 pointer-events-none"
                    }
                  />
                </div>
              </td>

              {/* Actions */}
              <td className="py-2 pr-3">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(field)}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm dark:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!field.isDefault && (
                    <button
                      onClick={() => onDelete(field.id, field.isDefault)}
                      className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldConfigTable;
