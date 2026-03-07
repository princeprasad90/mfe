import React from "react";
import "../_shared/form.styles.css";
import "./TextArea.styles.css";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = "", id, rows = 4, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="pui-input-wrapper">
        {label && <label htmlFor={inputId}>{label}</label>}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`pui-textarea ${error ? "pui-input--error" : ""} ${className}`}
          {...rest}
        />
        {error && <span className="pui-input-error">{error}</span>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
