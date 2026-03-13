import React from "react";

type Props = {
  className?: string;
};

export const SearchSmallIcon: React.FC<Props> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-search text-genius-cream hover:opacity-70 transition-opacity cursor-pointer ${className ?? ""}`}
    aria-hidden="true"
  >
    <path d="m21 21-4.34-4.34"></path>
    <circle cx="11" cy="11" r="8"></circle>
  </svg>
);

