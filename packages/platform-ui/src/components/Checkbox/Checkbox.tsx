import React from "react";
import "../_shared/form.styles.css";
import "./Checkbox.styles.css";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="pui-checkbox-wrapper">
        <label className={`pui-checkbox-label ${error ? "pui-checkbox-label--error" : ""}`}>
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={`pui-checkbox ${className}`}
            {...rest}
          />
          {label && <span className="pui-checkbox-text">{label}</span>}
        </label>
        {error && <span className="pui-input-error">{error}</span>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
