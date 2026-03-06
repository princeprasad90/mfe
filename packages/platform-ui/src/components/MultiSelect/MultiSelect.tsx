import React, { useState, useRef, useEffect } from "react";
import "../_shared/form.styles.css";
import "./MultiSelect.styles.css";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (optValue: string) => {
    onChange(
      value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue],
    );
  };

  const remove = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className="pui-input-wrapper">
      {label && <label>{label}</label>}
      <div className="pui-multiselect" ref={containerRef}>
        <div
          className="pui-multiselect__trigger"
          tabIndex={0}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
        >
          {selectedLabels.length === 0 && (
            <span style={{ color: "var(--pui-text-muted)" }}>{placeholder}</span>
          )}
          {selectedLabels.map((opt) => (
            <span key={opt.value} className="pui-multiselect__tag">
              {opt.label}
              <span className="pui-multiselect__tag-remove" onClick={(e) => remove(opt.value, e)}>
                ×
              </span>
            </span>
          ))}
        </div>
        {open && (
          <div className="pui-multiselect__dropdown">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`pui-multiselect__option ${value.includes(opt.value) ? "pui-multiselect__option--selected" : ""}`}
                onClick={() => toggle(opt.value)}
              >
                {value.includes(opt.value) ? "✓ " : ""}{opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span className="pui-input-error">{error}</span>}
    </div>
  );
};
