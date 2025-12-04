import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  onClick,
  className = "",
  children,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
        text-gray-700 dark:text-gray-300 
        bg-white dark:bg-gray-800 
        border border-gray-300 dark:border-gray-600 
        rounded-full
        hover:bg-gray-50 dark:hover:bg-gray-700 
        hover:border-gray-400 dark:hover:border-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
        dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        shadow-xs hover:shadow-sm
        ${className}
      `}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || "Back"}
    </button>
  );
};

export default BackButton;
