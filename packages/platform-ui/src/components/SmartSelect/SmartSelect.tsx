import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../_shared/form.styles.css";
import "../Select/Select.styles.css";
import "../Loader/Loader.styles.css";
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

export interface SmartSelectProps {
  /** Field label rendered above the select. */
  label?: string;

  /** Where the options come from — static array or API endpoint. */
  dataSource: DataSource;

  /**
   * Name (or names) of other fields this select depends on.
   * When a dependency value changes the options are re-fetched / re-filtered.
   *
   * Pass a single string or an array:
   *   dependsOn="country"
   *   dependsOn={["country", "region"]}
   */
  dependsOn?: string | string[];

  /**
   * Current values of the dependency fields.
   * Keyed by dependency name — the component watches these for changes.
   *
   *   dependencyValues={{ country: 1, region: 4 }}
   */
  dependencyValues?: Record<string, unknown>;

  /** Values to exclude from the rendered options (matched against `valueField`). */
  exclude?: (string | number)[];

  /** Property name on each data item used as the `<option value>` (default "id"). */
  valueField?: string;

  /** Property name on each data item used as the visible text (default "name"). */
  textField?: string;

  /** Controlled value. */
  value?: string | number;

  /** Placeholder shown as the first disabled option. */
  placeholder?: string;

  /** Validation error message. */
  error?: string;

  /** Change handler — receives the selected value and the full raw item. */
  onChange?: (value: string, item: Record<string, unknown> | null) => void;

  /** Extra class name. */
  className?: string;

  /** Disable the select. */
  disabled?: boolean;

  /** Show a small spinner while loading API data (default true). */
  showLoader?: boolean;
}

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
  placeholder = "Select…",
  error,
  onChange,
  className = "",
  disabled = false,
  showLoader = true,
}) => {
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Normalise dependsOn to an array
  const deps: string[] = useMemo(
    () => (dependsOn ? (Array.isArray(dependsOn) ? dependsOn : [dependsOn]) : []),
    [dependsOn],
  );

  // Serialised dependency values — triggers re-fetch when any changes
  const depFingerprint = useMemo(
    () => JSON.stringify(deps.map((d) => dependencyValues[d])),
    [deps, dependencyValues],
  );

  // ── fetchApiData ────────────────────────────────────────────────────────

  const fetchApiData = useCallback(
    async (ds: ApiDataSource, signal: AbortSignal) => {
      // Build URL — append dependency values as query params for GET
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

      // Drill into resultKey (e.g. "data.items")
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

  // ── handleStaticData ────────────────────────────────────────────────────

  const handleStaticData = useCallback(
    (ds: StaticDataSource): Record<string, unknown>[] => {
      // If there are dependencies declared, filter static data where each
      // dependency field matches the provided value.
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

  // ── watchDependencies — re-fetch / re-filter when deps change ──────────

  useEffect(() => {
    // If dependencies are declared but none have a value yet, skip and clear
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

    // Cancel any previous in-flight request
    abortRef.current?.abort();

    if (dataSource.type === "static") {
      setRawData(handleStaticData(dataSource));
      return;
    }

    // API fetch
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
    // depFingerprint encodes all dependency value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.type, (dataSource as ApiDataSource).url, depFingerprint]);

  // ── filterExcludedValues ────────────────────────────────────────────────

  const options = useMemo(() => {
    if (exclude.length === 0) return rawData;

    const excludeSet = new Set(exclude.map(String));
    return rawData.filter((item) => !excludeSet.has(String(item[valueField])));
  }, [rawData, exclude, valueField]);

  // ── Render ──────────────────────────────────────────────────────────────

  const selectId = label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedItem = options.find((item) => String(item[valueField]) === selectedValue) ?? null;
    onChange?.(selectedValue, selectedItem);
  };

  const displayError = error ?? fetchError;
  const isDisabled = disabled || loading;

  return (
    <div className="pui-input-wrapper">
      {label && <label htmlFor={selectId}>{label}</label>}

      <div style={{ position: "relative" }}>
        <select
          id={selectId}
          className={`pui-select ${displayError ? "pui-input--error" : ""} ${className}`}
          value={value !== undefined ? String(value) : ""}
          onChange={handleChange}
          disabled={isDisabled}
        >
          <option value="" disabled>
            {loading && showLoader ? "Loading…" : placeholder}
          </option>
          {options.map((item) => (
            <option key={String(item[valueField])} value={String(item[valueField])}>
              {String(item[textField])}
            </option>
          ))}
        </select>

        {loading && showLoader && (
          <span
            className="pui-loader pui-loader--sm"
            style={{ position: "absolute", right: 32, top: "50%", marginTop: -8 }}
          />
        )}
      </div>

      {displayError && <span className="pui-input-error">{displayError}</span>}
    </div>
  );
};

SmartSelect.displayName = "SmartSelect";
