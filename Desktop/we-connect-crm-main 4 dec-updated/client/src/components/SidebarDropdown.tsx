import React, { useState } from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SidebarChildItem {
  name: string;
  href: string;
  permission?: string;
}

export interface SidebarDropdownProps {
  name: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  childrenItems: SidebarChildItem[];
  canShowChild: (permission?: string) => boolean;
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  name,
  icon: Icon,
  isCollapsed,
  childrenItems,
  canShowChild,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (childrenItems.filter((c) => canShowChild(c.permission)).length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isCollapsed ? "justify-center px-3 py-2" : "justify-between"
        } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}
        >
          <Icon size={20} className={`${isCollapsed ? "mr-0" : "mr-3"}`} />
          {!isCollapsed && <span>{name}</span>}
        </div>
        {!isCollapsed && (
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </button>

      {/* Children */}
      {open && !isCollapsed && (
        <div className="mt-1 ml-9 space-y-1">
          {childrenItems
            .filter((c) => canShowChild(c.permission))
            .map((child) => (
              <button
                key={child.href}
                onClick={() => navigate(child.href)}
                className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {child.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default SidebarDropdown;
