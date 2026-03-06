import React from "react";
import "../_shared/form.styles.css";
import "./Select.styles.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, className = "", id, ...rest }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="pui-input-wrapper">
        {label && <label htmlFor={selectId}>{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={`pui-select ${error ? "pui-input--error" : ""} ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="pui-input-error">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
