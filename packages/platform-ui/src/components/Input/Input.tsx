import React from "react";
import "../_shared/form.styles.css";
import "./Input.styles.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="pui-input-wrapper">
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`pui-input ${error ? "pui-input--error" : ""} ${className}`}
          {...rest}
        />
        {error && <span className="pui-input-error">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
