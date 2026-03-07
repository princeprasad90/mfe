/**
 * @mfe/platform-ui — DetailView
 *
 * Declarative detail page component that renders a data object
 * as a labelled field grid with actions and navigation.
 *
 * @example
 * ```tsx
 * <DetailView
 *   title="Payment Details"
 *   data={payment}
 *   fields={[
 *     { key: 'customer', label: 'Customer' },
 *     { key: 'amount', label: 'Amount', format: 'currency' },
 *     { key: 'status', label: 'Status', render: (v) => <Badge>{v}</Badge> },
 *   ]}
 *   actions={[
 *     { label: 'Approve', variant: 'success', onClick: handleApprove },
 *   ]}
 *   backLink={{ label: 'Back to List', path: '/cbms' }}
 *   navigate={goTo}
 * />
 * ```
 */

import React from "react";
import "./DetailView.styles.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DetailField<T = Record<string, unknown>> {
  /** Property key on the data object */
  key: string;
  /** Display label */
  label: string;
  /** Auto-format the value */
  format?: "currency" | "date" | "dateTime" | "number" | "boolean";
  /** Custom renderer */
  render?: (value: unknown, data: T) => React.ReactNode;
  /** Show/hide this field. Boolean or function of data. */
  visible?: boolean | ((data: T) => boolean);
  /** Grid column span (1–3, default 1) */
  span?: number;
}

export interface DetailAction<T = Record<string, unknown>> {
  /** Button label */
  label: string;
  /** Button style variant */
  variant?: "default" | "primary" | "danger" | "success" | "ghost";
  /** Show window.confirm before executing */
  confirm?: string;
  /** Action handler */
  onClick: (data: T) => void | Promise<void>;
  /** Conditionally show this action */
  visible?: (data: T) => boolean;
  /** Disable the button (e.g., while loading) */
  loading?: boolean;
}

export interface DetailViewProps<T = Record<string, unknown>> {
  /** Section title */
  title?: string;
  /** Data object to display */
  data: T | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | Error | null;
  /** Field definitions */
  fields: DetailField<T>[];
  /** Action buttons */
  actions?: DetailAction<T>[];
  /** Back navigation link */
  backLink?: { label: string; path: string };
  /** Navigation function */
  navigate?: (path: string) => void;
  /** Number of grid columns (default: 2) */
  columns?: 1 | 2 | 3;
  /** Extra CSS class */
  className?: string;
  /** Retry handler for error state */
  onRetry?: () => void;
}

// ─── Value formatter ──────────────────────────────────────────────────────────

function formatDetailValue(
  value: unknown,
  format?: string,
): React.ReactNode {
  if (value === null || value === undefined) return "—";
  switch (format) {
    case "currency":
      return `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case "date":
      return new Date(String(value)).toLocaleDateString();
    case "dateTime":
      return new Date(String(value)).toLocaleString();
    case "number":
      return Number(value).toLocaleString();
    case "boolean":
      return value ? "Yes" : "No";
    default:
      return String(value);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DetailView<T extends Record<string, unknown>>({
  title,
  data,
  loading,
  error,
  fields,
  actions,
  backLink,
  navigate,
  columns = 2,
  className,
  onRetry,
}: DetailViewProps<T>): React.ReactElement {
  const errorMsg = error instanceof Error ? error.message : error;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`dv ${className ?? ""}`}>
        <div className="dv__loading">
          <div className="dv__spinner" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <div className={`dv ${className ?? ""}`}>
        <div className="dv__error">
          <span>⚠️</span>
          <p>{errorMsg}</p>
          {onRetry && (
            <button className="dv__retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className={`dv ${className ?? ""}`}>
        <div className="dv__empty">
          <span>🔍</span>
          <p>No data found.</p>
          {backLink && navigate && (
            <button
              className="dv__back-btn"
              onClick={() => navigate(backLink.path)}
            >
              {backLink.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Filter visible fields ──────────────────────────────────────────────────
  const visibleFields = fields.filter((f) => {
    if (typeof f.visible === "function") return f.visible(data);
    return f.visible !== false;
  });

  const handleAction = async (action: DetailAction<T>) => {
    if (action.confirm) {
      const ok = window.confirm(action.confirm);
      if (!ok) return;
    }
    await action.onClick(data);
  };

  return (
    <div className={`dv ${className ?? ""}`}>
      {/* Title */}
      {title && (
        <div className="dv__header">
          <h2 className="dv__title">{title}</h2>
        </div>
      )}

      {/* Field grid */}
      <div
        className="dv__grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {visibleFields.map((field) => (
          <div
            key={field.key}
            className="dv__field"
            style={
              field.span ? { gridColumn: `span ${field.span}` } : undefined
            }
          >
            <dt className="dv__label">{field.label}</dt>
            <dd className="dv__value">
              {field.render
                ? field.render((data as any)[field.key], data)
                : formatDetailValue((data as any)[field.key], field.format)}
            </dd>
          </div>
        ))}
      </div>

      {/* Actions */}
      {((actions && actions.length > 0) || backLink) && (
        <div className="dv__actions">
          {actions
            ?.filter((a) => !a.visible || a.visible(data))
            .map((action, i) => (
              <button
                key={i}
                className={`dv__action-btn dv__action-btn--${action.variant ?? "default"}`}
                onClick={() => handleAction(action)}
                disabled={action.loading}
              >
                {action.loading ? "…" : action.label}
              </button>
            ))}
          {backLink && navigate && (
            <button
              className="dv__action-btn dv__action-btn--ghost"
              onClick={() => navigate(backLink.path)}
            >
              {backLink.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
