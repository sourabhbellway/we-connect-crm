import React from "react";

type Props = {
  show?: boolean;
  className?: string;
  message?: string;
};

const MustChangePasswordNotice: React.FC<Props> = ({
  show = true,
  className = "",
  message = "You must change your password before continuing.",
}) => {
  if (!show) return null;
  return (
    <p className={`text-xs text-red-500 font-medium ${className}`}>{message}</p>
  );
};

export default MustChangePasswordNotice;
