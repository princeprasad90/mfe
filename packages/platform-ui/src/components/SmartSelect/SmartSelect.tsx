import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactSelect, { components, type GroupBase, type MultiValue, type SingleValue, type StylesConfig } from "react-select";
import "../_shared/form.styles.css";
import "./SmartSelect.styles.css";

// ── Types ────────────────────────────────────────────────────────────────────

/** Static data source — options provided inline. */
export interface StaticDataSource {
  type: "static";
  data: Record<string, unknown>[];
}

/** API data source — fetched from a URL. */
export interface ApiDataSource {
  type: "api";
  /** Endpoint URL (absolute or relative to the configured base). */
  url: string;
  /** HTTP method (default GET). */
  method?: "GET" | "POST";
  /** Extra headers. */
  headers?: Record<string, string>;
  /** Body for POST requests (merged with dependency values). */
  body?: Record<string, unknown>;
  /** JSONPath-like key to reach the array in the response (e.g. "data.items"). */
  resultKey?: string;
}

export type DataSource = StaticDataSource | ApiDataSource;

/** Internal option shape fed to react-select. */
export interface SmartOption {
  value: string;
  label: string;
  /** The original raw data item. */
  raw: Record<string, unknown>;
}

export interface SmartSelectProps {
  /** Field label rendered above the select. */
  label?: string;

  /** Where the options come from — static array or API endpoint. */
  dataSource: DataSource;

  /**
   * Name (or names) of other fields this select depends on.
   * When a dependency value changes the options are re-fetched / re-filtered.
   */
  dependsOn?: string | string[];

  /**
   * Current values of the dependency fields.
   * Keyed by dependency name — the component watches these for changes.
   */
  dependencyValues?: Record<string, unknown>;

  /** Values to exclude from the rendered options (matched against `valueField`). */
  exclude?: (string | number)[];

  /** Property name on each data item used as the option value (default "id"). */
  valueField?: string;

  /** Property name on each data item used as the visible text (default "name"). */
  textField?: string;

  /** Controlled value (single-select mode). */
  value?: string | number;

  /** Controlled values (multi-select mode). */
  multiValue?: (string | number)[];

  /** Placeholder shown when nothing is selected. */
  placeholder?: string;

  /** Validation error message. */
  error?: string;

  /** Change handler — single-select mode. */
  onChange?: (value: string, item: Record<string, unknown> | null) => void;

  /** Change handler — multi-select mode. */
  onMultiChange?: (values: string[], items: Record<string, unknown>[]) => void;

  /** Extra class name on the root wrapper. */
  className?: string;

  /** Disable the select. */
  disabled?: boolean;

  /** Show a small spinner while loading API data (default true). */
  showLoader?: boolean;

  /** Enable the search/filter input in the dropdown (default true). */
  searchable?: boolean;

  /** Show the × clear button (default true). */
  clearable?: boolean;

  /** Enable multi-select mode with tags (default false). */
  multi?: boolean;

  /** Max height in px for the dropdown list (default 250). */
  maxDropdownHeight?: number;

  /** Text shown when the search yields no matches. */
  noResultsText?: string;

  /** Property name to group options by (renders group headers). */
  groupBy?: string;
}

// ── Style overrides — map CSS variables into react-select ────────────────────

const READ_VAR = (name: string, fallback: string) =>
  typeof getComputedStyle !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback;

const smartSelectStyles: StylesConfig<SmartOption, boolean, GroupBase<SmartOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    fontFamily: "var(--pui-font)",
    fontSize: "var(--pui-font-size-md)",
    borderColor: state.isFocused
      ? READ_VAR("--pui-accent", "#de1621")
      : READ_VAR("--pui-border", "#e0e0e0"),
    boxShadow: state.isFocused ? `0 0 0 3px rgba(222, 22, 33, 0.12)` : "none",
    borderRadius: "var(--pui-radius-md)",
    backgroundColor: state.isDisabled
      ? "var(--pui-background)"
      : "var(--pui-surface)",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": {
      borderColor: READ_VAR("--pui-accent", "#de1621"),
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--pui-text)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--pui-text)",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 1000,
    borderRadius: "var(--pui-radius-md)",
    border: `1px solid ${READ_VAR("--pui-border", "#e0e0e0")}`,
    boxShadow: "var(--pui-shadow-md)",
    overflow: "hidden",
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px 0",
  }),
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    fontSize: "var(--pui-font-size-md)",
    backgroundColor: state.isSelected
      ? "rgba(222, 22, 33, 0.08)"
      : state.isFocused
        ? "var(--pui-background)"
        : "transparent",
    color: state.isSelected
      ? READ_VAR("--pui-accent", "#de1621")
      : "var(--pui-text)",
    fontWeight: state.isSelected ? 500 : 400,
    "&:active": {
      backgroundColor: "rgba(222, 22, 33, 0.12)",
    },
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
  groupHeading: (base) => ({
    ...base,
    fontSize: "var(--pui-font-size-sm)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--pui-text-muted)",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "var(--pui-border)",
  }),
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
    "&:hover": {
      color: READ_VAR("--pui-accent", "#de1621"),
    },
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: READ_VAR("--pui-accent", "#de1621"),
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--pui-text-muted)",
    fontSize: "var(--pui-font-size-md)",
  }),
};

// Error variant — override border color
const errorControlStyle = (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
  ...smartSelectStyles.control!(base as any, state as any),
  borderColor: READ_VAR("--pui-error", "#dc2626"),
  "&:hover": { borderColor: READ_VAR("--pui-error", "#dc2626") },
});

// ── Custom loading message component ─────────────────────────────────────────

const LoadingMessage = (props: any) => (
  <components.LoadingMessage {...props}>Loading…</components.LoadingMessage>
);

// ── Component ────────────────────────────────────────────────────────────────

export const SmartSelect: React.FC<SmartSelectProps> = ({
  label,
  dataSource,
  dependsOn,
  dependencyValues = {},
  exclude = [],
  valueField = "id",
  textField = "name",
  value,
  multiValue = [],
  placeholder = "Select…",
  error,
  onChange,
  onMultiChange,
  className = "",
  disabled = false,
  showLoader = true,
  searchable = true,
  clearable = true,
  multi = false,
  maxDropdownHeight = 250,
  noResultsText = "No results found",
  groupBy,
}) => {
  // ── Data-fetching state ───────────────────────────────────────────────

  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Dependency helpers ────────────────────────────────────────────────

  const deps: string[] = useMemo(
    () => (dependsOn ? (Array.isArray(dependsOn) ? dependsOn : [dependsOn]) : []),
    [dependsOn],
  );

  const depFingerprint = useMemo(
    () => JSON.stringify(deps.map((d) => dependencyValues[d])),
    [deps, dependencyValues],
  );

  // ── fetchApiData ──────────────────────────────────────────────────────

  const fetchApiData = useCallback(
    async (ds: ApiDataSource, signal: AbortSignal) => {
      let url = ds.url;
      const params = new URLSearchParams();

      deps.forEach((d) => {
        const val = dependencyValues[d];
        if (val !== undefined && val !== null && val !== "") {
          params.set(d, String(val));
        }
      });

      const queryString = params.toString();

      const init: RequestInit = {
        method: ds.method ?? "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...ds.headers,
        },
        credentials: "include",
        signal,
      };

      if (init.method === "GET" && queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }

      if (init.method === "POST") {
        const body: Record<string, unknown> = { ...ds.body };
        deps.forEach((d) => {
          const val = dependencyValues[d];
          if (val !== undefined && val !== null) body[d] = val;
        });
        init.body = JSON.stringify(body);
      }

      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let json = await res.json();

      if (ds.resultKey) {
        for (const key of ds.resultKey.split(".")) {
          json = json?.[key];
        }
      }

      if (!Array.isArray(json)) {
        throw new Error("Response is not an array");
      }

      return json as Record<string, unknown>[];
    },
    [deps, dependencyValues],
  );

  // ── handleStaticData ──────────────────────────────────────────────────

  const handleStaticData = useCallback(
    (ds: StaticDataSource): Record<string, unknown>[] => {
      if (deps.length === 0) return ds.data;

      return ds.data.filter((item) =>
        deps.every((d) => {
          const expected = dependencyValues[d];
          if (expected === undefined || expected === null || expected === "") return true;
          return String(item[d]) === String(expected);
        }),
      );
    },
    [deps, dependencyValues],
  );

  // ── Watch dependencies — re-fetch / re-filter when deps change ────────

  useEffect(() => {
    if (deps.length > 0) {
      const allEmpty = deps.every((d) => {
        const v = dependencyValues[d];
        return v === undefined || v === null || v === "";
      });
      if (allEmpty) {
        setRawData([]);
        return;
      }
    }

    abortRef.current?.abort();

    if (dataSource.type === "static") {
      setRawData(handleStaticData(dataSource));
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setFetchError(null);

    fetchApiData(dataSource, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setRawData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("[SmartSelect] Fetch failed:", err);
          setFetchError(err.message ?? "Failed to load options");
          setRawData([]);
          setLoading(false);
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.type, (dataSource as ApiDataSource).url, depFingerprint]);

  // ── Build react-select options (optionally grouped) ───────────────────

  const baseOptions: SmartOption[] = useMemo(() => {
    let items = rawData;

    // Exclude filter
    if (exclude.length > 0) {
      const excludeSet = new Set(exclude.map(String));
      items = items.filter((item) => !excludeSet.has(String(item[valueField])));
    }

    return items.map((item) => ({
      value: String(item[valueField]),
      label: String(item[textField]),
      raw: item,
    }));
  }, [rawData, exclude, valueField, textField]);

  const selectOptions = useMemo(() => {
    if (!groupBy) return baseOptions;

    const map = new Map<string, SmartOption[]>();
    baseOptions.forEach((opt) => {
      const key = String(opt.raw[groupBy] ?? "");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    });

    return Array.from(map.entries()).map(([label, options]) => ({
      label,
      options,
    }));
  }, [baseOptions, groupBy]);

  // ── Derive current value for react-select ─────────────────────────────

  const selectedValue = useMemo(() => {
    if (multi) {
      const set = new Set(multiValue.map(String));
      return baseOptions.filter((o) => set.has(o.value));
    }
    if (value === undefined || value === "") return null;
    return baseOptions.find((o) => o.value === String(value)) ?? null;
  }, [multi, value, multiValue, baseOptions]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSingleChange = (opt: SingleValue<SmartOption>) => {
    if (!opt) {
      onChange?.("", null);
      return;
    }
    onChange?.(opt.value, opt.raw);
  };

  const handleMultiChange = (opts: MultiValue<SmartOption>) => {
    const values = opts.map((o) => o.value);
    const items = opts.map((o) => o.raw);
    onMultiChange?.(values, items);
  };

  // ── Derived ───────────────────────────────────────────────────────────

  const displayError = error ?? fetchError;
  const isDisabled = disabled || (loading && !showLoader);
  const selectId = label?.toLowerCase().replace(/\s+/g, "-");

  // Merge styles — override control border for errors
  const mergedStyles: StylesConfig<SmartOption, boolean, GroupBase<SmartOption>> = useMemo(
    () =>
      displayError
        ? { ...smartSelectStyles, control: errorControlStyle as any }
        : smartSelectStyles,
    [displayError],
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className={`pui-input-wrapper ${className}`}>
      {label && <label htmlFor={selectId}>{label}</label>}

      <ReactSelect<SmartOption, boolean, GroupBase<SmartOption>>
        inputId={selectId}
        options={selectOptions as any}
        value={selectedValue}
        onChange={(val: any) => {
          if (multi) handleMultiChange(val as MultiValue<SmartOption>);
          else handleSingleChange(val as SingleValue<SmartOption>);
        }}
        isMulti={multi as any}
        isSearchable={searchable}
        isClearable={clearable}
        isDisabled={isDisabled}
        isLoading={loading && showLoader}
        placeholder={placeholder}
        noOptionsMessage={() => noResultsText}
        maxMenuHeight={maxDropdownHeight}
        styles={mergedStyles}
        components={{ LoadingMessage }}
        closeMenuOnSelect={!multi}
        hideSelectedOptions={false}
        menuPlacement="auto"
      />

      {displayError && <span className="pui-input-error">{displayError}</span>}
    </div>
  );
};

SmartSelect.displayName = "SmartSelect";
