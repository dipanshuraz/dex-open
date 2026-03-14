"use client";

import * as React from "react";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  "aria-label": string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onCheckedChange,
      "aria-label": ariaLabel,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const state = checked ? "checked" : "unchecked";
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        value="on"
        data-state={state}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-genius-pink data-[state=unchecked]:bg-genius-blue h-4 w-[28px] rounded-[2px] ${className}`.trim()}
        {...props}
      >
        <span
          data-state={state}
          className="pointer-events-none block bg-background shadow-lg ring-[3px] data-[state=checked]:ring-genius-blue data-[state=unchecked]:ring-genius-pink transition-transform data-[state=unchecked]:bg-genius-pink data-[state=checked]:bg-genius-blue data-[state=unchecked]:translate-x-0 h-3 w-3 rounded-[2px] data-[state=checked]:translate-x-[12px]"
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
