import React, { useMemo } from "react";
import ReactSelect, { type SingleValue, type StylesConfig, type GroupBase } from "react-select";
import "../_shared/form.styles.css";

// ── Types (unchanged public API) ─────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// ── Internal option type for react-select ────────────────────────────────────

interface RSOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

// ── Theme-aware styles ───────────────────────────────────────────────────────

const READ_VAR = (name: string, fallback: string) =>
  typeof getComputedStyle !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback;

const selectStyles: StylesConfig<RSOption, false, GroupBase<RSOption>> = {
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
  singleValue: (base) => ({ ...base, color: "var(--pui-text)" }),
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
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    fontSize: "var(--pui-font-size-md)",
    backgroundColor: state.isSelected
      ? "rgba(222, 22, 33, 0.08)"
      : state.isFocused
        ? "var(--pui-background)"
        : "transparent",
    color: state.isSelected ? READ_VAR("--pui-accent", "#de1621") : "var(--pui-text)",
    fontWeight: state.isSelected ? 500 : 400,
    opacity: state.isDisabled ? 0.5 : 1,
    "&:active": { backgroundColor: "rgba(222, 22, 33, 0.12)" },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: "var(--pui-border)" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: "var(--pui-text-muted)",
    transition: "transform 200ms ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    "&:hover": { color: "var(--pui-text)" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
    fontSize: "var(--pui-font-size-md)",
  }),
};

const errorControlStyle = (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
  ...selectStyles.control!(base as any, state as any),
  borderColor: READ_VAR("--pui-error", "#dc2626"),
  "&:hover": { borderColor: READ_VAR("--pui-error", "#dc2626") },
});

// ── Component ────────────────────────────────────────────────────────────────

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder = "Select…",
  error,
  className = "",
  id,
  disabled = false,
  value,
  onChange,
}) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const rsOptions: RSOption[] = useMemo(
    () => options.map((o) => ({ value: o.value, label: o.label, isDisabled: o.disabled })),
    [options],
  );

  const selectedValue = useMemo(
    () => rsOptions.find((o) => o.value === value) ?? null,
    [rsOptions, value],
  );

  const mergedStyles = useMemo(
    () => (error ? { ...selectStyles, control: errorControlStyle as any } : selectStyles),
    [error],
  );

  const handleChange = (opt: SingleValue<RSOption>) => {
    onChange?.(opt?.value ?? "");
  };

  return (
    <div className={`pui-input-wrapper ${className}`}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <ReactSelect<RSOption, false>
        inputId={selectId}
        options={rsOptions}
        value={selectedValue}
        onChange={handleChange}
        isSearchable
        isClearable={false}
        isDisabled={disabled}
        placeholder={placeholder}
        styles={mergedStyles}
        menuPlacement="auto"
      />
      {error && <span className="pui-input-error">{error}</span>}
    </div>
  );
};

Select.displayName = "Select";
