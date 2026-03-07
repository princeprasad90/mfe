import React, { useMemo } from "react";
import ReactSelect, { type MultiValue, type StylesConfig, type GroupBase } from "react-select";
import "../_shared/form.styles.css";

// ── Types (unchanged public API) ─────────────────────────────────────────────

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
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

// ── Internal option type ─────────────────────────────────────────────────────

interface RSOption {
  value: string;
  label: string;
}

// ── Theme-aware styles ───────────────────────────────────────────────────────

const READ_VAR = (name: string, fallback: string) =>
  typeof getComputedStyle !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback;

const multiStyles: StylesConfig<RSOption, true, GroupBase<RSOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    fontFamily: "var(--pui-font)",
    fontSize: "var(--pui-font-size-md)",
    borderColor: state.isFocused
      ? READ_VAR("--pui-accent", "#de1621")
      : READ_VAR("--pui-border", "#e0e0e0"),
    boxShadow: state.isFocused ? "0 0 0 3px rgba(222, 22, 33, 0.12)" : "none",
    borderRadius: "var(--pui-radius-md)",
    backgroundColor: state.isDisabled ? "var(--pui-background)" : "var(--pui-surface)",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": { borderColor: READ_VAR("--pui-accent", "#de1621") },
  }),
  placeholder: (base) => ({ ...base, color: "var(--pui-text-muted)" }),
  input: (base) => ({ ...base, color: "var(--pui-text)" }),
  menu: (base) => ({
    ...base,
    zIndex: 1000,
    borderRadius: "var(--pui-radius-md)",
    border: `1px solid ${READ_VAR("--pui-border", "#e0e0e0")}`,
    boxShadow: "var(--pui-shadow-md)",
    overflow: "hidden",
  }),
  menuList: (base) => ({ ...base, padding: "4px 0" }),
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    fontSize: "var(--pui-font-size-md)",
    backgroundColor: state.isSelected
      ? "rgba(222, 22, 33, 0.08)"
      : state.isFocused
        ? "var(--pui-background)"
        : "transparent",
    color: state.isSelected ? READ_VAR("--pui-accent", "#de1621") : "var(--pui-text)",
    fontWeight: state.isSelected ? 500 : 400,
    "&:active": { backgroundColor: "rgba(222, 22, 33, 0.12)" },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "var(--pui-background)",
    borderRadius: "var(--pui-radius-sm)",
    border: "1px solid var(--pui-border)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--pui-text)",
    fontSize: "var(--pui-font-size-sm)",
    padding: "1px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
    borderRadius: "0 var(--pui-radius-sm) var(--pui-radius-sm) 0",
    "&:hover": {
      backgroundColor: READ_VAR("--pui-accent", "#de1621"),
      color: "#fff",
    },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: "var(--pui-border)" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: "var(--pui-text-muted)",
    transition: "transform 200ms ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    "&:hover": { color: "var(--pui-text)" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
    "&:hover": { color: READ_VAR("--pui-accent", "#de1621") },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
    fontSize: "var(--pui-font-size-md)",
  }),
};

const errorControlStyle = (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
  ...multiStyles.control!(base as any, state as any),
  borderColor: READ_VAR("--pui-error", "#dc2626"),
  "&:hover": { borderColor: READ_VAR("--pui-error", "#dc2626") },
});

// ── Component ────────────────────────────────────────────────────────────────

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  error,
  disabled = false,
  className = "",
  searchable = true,
}) => {
  const selectId = label?.toLowerCase().replace(/\s+/g, "-");

  const rsOptions: RSOption[] = useMemo(
    () => options.map((o) => ({ value: o.value, label: o.label })),
    [options],
  );

  const selectedValues = useMemo(() => {
    const set = new Set(value);
    return rsOptions.filter((o) => set.has(o.value));
  }, [rsOptions, value]);

  const mergedStyles = useMemo(
    () => (error ? { ...multiStyles, control: errorControlStyle as any } : multiStyles),
    [error],
  );

  const handleChange = (opts: MultiValue<RSOption>) => {
    onChange(opts.map((o) => o.value));
  };

  return (
    <div className={`pui-input-wrapper ${className}`}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <ReactSelect<RSOption, true>
        inputId={selectId}
        options={rsOptions}
        value={selectedValues}
        onChange={handleChange}
        isMulti
        isSearchable={searchable}
        isClearable
        isDisabled={disabled}
        placeholder={placeholder}
        styles={mergedStyles}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPlacement="auto"
      />
      {error && <span className="pui-input-error">{error}</span>}
    </div>
  );
};

MultiSelect.displayName = "MultiSelect";
