import React from "react";

type Props = {
  className?: string;
};

export const ClockIcon: React.FC<Props> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-clock hover:opacity-70 transition-opacity text-genius-cream/50 cursor-pointer ${className ?? ""}`}
    aria-hidden="true"
  >
    <path d="M12 6v6l4 2"></path>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

