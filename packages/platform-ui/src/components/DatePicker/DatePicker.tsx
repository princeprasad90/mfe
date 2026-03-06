import React, { useRef } from "react";
import "../_shared/form.styles.css";
import "../Input/Input.styles.css";
import "./DatePicker.styles.css";

export interface DatePickerProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  error?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  error,
  placeholder = "Select date",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pui-input-wrapper">
      {label && <label>{label}</label>}
      <div className="pui-datepicker">
        <input
          ref={inputRef}
          type="date"
          className={`pui-input ${error ? "pui-input--error" : ""}`}
          value={value}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <span className="pui-input-error">{error}</span>}
    </div>
  );
};
