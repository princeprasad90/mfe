/**
 * @mfe/platform-ui — TableBuilder
 *
 * Declarative, config-driven data table with built-in sorting, filtering,
 * search, pagination, and row actions.
 *
 * @example
 * ```tsx
 * <TableBuilder
 *   columns={[
 *     { key: 'customer', label: 'Customer', sortable: true, filterable: true },
 *     { key: 'amount', label: 'Amount', format: 'currency', sortable: true },
 *     { key: 'status', label: 'Status', filterable: true, filterType: 'select',
 *       filterOptions: [{ value: 'Pending', label: 'Pending' }] },
 *   ]}
 *   data={payments}
 *   rowKey="id"
 *   searchable
 *   pageSize={10}
 *   rowActions={[{ label: 'View', onClick: (row) => navigate(`/details/${row.id}`) }]}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback } from "react";
import "./TableBuilder.styles.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableBuilderColumn<T = Record<string, unknown>> {
  /** Property key on the data object */
  key: string;
  /** Column header label */
  label: string;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Enable filtering on this column */
  filterable?: boolean;
  /** Filter input type (default: 'text') */
  filterType?: "text" | "select";
  /** Options for select filter */
  filterOptions?: { value: string; label: string }[];
  /** Auto-format the value */
  format?: "currency" | "date" | "dateTime" | "number" | "percent" | "boolean";
  /** Custom cell renderer */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface TableRowAction<T = Record<string, unknown>> {
  /** Button label */
  label: string;
  /** Emoji or icon text */
  icon?: string;
  /** Button style variant */
  variant?: "default" | "primary" | "danger" | "success";
  /** Show window.confirm before executing */
  confirm?: string;
  /** Action handler */
  onClick: (row: T) => void | Promise<void>;
  /** Conditionally show this action */
  visible?: (row: T) => boolean;
}

export interface TableBuilderProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: TableBuilderColumn<T>[];
  /** Data array */
  data: T[];
  /** Unique key property on each row */
  rowKey: string;
  /** Default sort state */
  defaultSort?: { key: string; direction: "asc" | "desc" };
  /** Show search input */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Rows per page (default: 10) */
  pageSize?: number;
  /** Row action buttons */
  rowActions?: TableRowAction<T>[];
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Extra toolbar content (right side) */
  toolbar?: React.ReactNode;
  /** Empty state emoji */
  emptyIcon?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Show loading state */
  loading?: boolean;
  /** Alternate row background */
  striped?: boolean;
  /** Extra CSS class */
  className?: string;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatValue(value: unknown, format?: string): React.ReactNode {
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
    case "percent":
      return `${Number(value).toFixed(1)}%`;
    case "boolean":
      return value ? "✓" : "✗";
    default:
      return String(value);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableBuilder<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  defaultSort,
  searchable = false,
  searchPlaceholder = "Search…",
  pageSize = 10,
  rowActions,
  onRowClick,
  toolbar,
  emptyIcon = "📋",
  emptyMessage = "No data found.",
  loading = false,
  striped = true,
  className,
}: TableBuilderProps<T>): React.ReactElement {
  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(defaultSort ?? null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // ── Filter + Search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];

    // Column filters
    for (const [colKey, filterVal] of Object.entries(filters)) {
      if (!filterVal) continue;
      result = result.filter((row) => {
        const v = String((row as any)[colKey] ?? "").toLowerCase();
        return v.includes(filterVal.toLowerCase());
      });
    }

    // Global search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const v = String((row as any)[col.key] ?? "").toLowerCase();
          return v.includes(q);
        }),
      );
    }

    return result;
  }, [data, columns, filters, search]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sort.key];
      const bVal = (b as any)[sort.key];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));

      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safeCurrentPage, pageSize]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilter = useCallback((colKey: string, val: string) => {
    setFilters((prev) => ({ ...prev, [colKey]: val }));
    setPage(1);
  }, []);

  const handleSort = useCallback((colKey: string) => {
    setSort((prev) => {
      if (prev?.key === colKey) {
        return prev.direction === "asc"
          ? { key: colKey, direction: "desc" }
          : null; // third click resets
      }
      return { key: colKey, direction: "asc" };
    });
  }, []);

  const handleAction = useCallback(
    async (action: TableRowAction<T>, row: T) => {
      if (action.confirm) {
        const ok = window.confirm(action.confirm);
        if (!ok) return;
      }
      await action.onClick(row);
    },
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const hasFilters = columns.some((c) => c.filterable);
  const hasActions = rowActions && rowActions.length > 0;

  return (
    <div className={`tb ${className ?? ""}`}>
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="tb__toolbar">
          {searchable && (
            <input
              type="text"
              className="tb__search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          )}
          {toolbar && <div className="tb__toolbar-extra">{toolbar}</div>}
        </div>
      )}

      {/* Table / Loading / Empty */}
      {loading ? (
        <div className="tb__loading">
          <div className="tb__spinner" />
          <span>Loading…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="tb__empty">
          <span className="tb__empty-icon">{emptyIcon}</span>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="tb__table-wrap">
          <table
            className={`tb__table ${striped ? "tb__table--striped" : ""}`}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align ?? "left" }}
                    className={col.sortable ? "tb__th--sortable" : ""}
                    onClick={
                      col.sortable ? () => handleSort(col.key) : undefined
                    }
                  >
                    <span>{col.label}</span>
                    {col.sortable && sort?.key === col.key && (
                      <span className="tb__sort-icon">
                        {sort.direction === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                ))}
                {hasActions && (
                  <th style={{ textAlign: "right", width: "1%" }}>Actions</th>
                )}
              </tr>

              {/* Filter row */}
              {hasFilters && (
                <tr className="tb__filter-row">
                  {columns.map((col) => (
                    <th key={col.key}>
                      {col.filterable ? (
                        col.filterType === "select" && col.filterOptions ? (
                          <select
                            className="tb__filter-select"
                            value={filters[col.key] ?? ""}
                            onChange={(e) =>
                              handleFilter(col.key, e.target.value)
                            }
                          >
                            <option value="">All</option>
                            {col.filterOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="tb__filter-input"
                            placeholder="Filter…"
                            value={filters[col.key] ?? ""}
                            onChange={(e) =>
                              handleFilter(col.key, e.target.value)
                            }
                          />
                        )
                      ) : null}
                    </th>
                  ))}
                  {hasActions && <th />}
                </tr>
              )}
            </thead>

            <tbody>
              {paged.map((row) => (
                <tr
                  key={String((row as any)[rowKey])}
                  className={onRowClick ? "tb__row--clickable" : ""}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align ?? "left" }}
                    >
                      {col.render
                        ? col.render((row as any)[col.key], row)
                        : formatValue((row as any)[col.key], col.format)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="tb__actions" style={{ textAlign: "right" }}>
                      {rowActions!
                        .filter((a) => !a.visible || a.visible(row))
                        .map((action, i) => (
                          <button
                            key={i}
                            className={`tb__action-btn tb__action-btn--${action.variant ?? "default"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(action, row);
                            }}
                          >
                            {action.icon && (
                              <span style={{ marginRight: 4 }}>
                                {action.icon}
                              </span>
                            )}
                            {action.label}
                          </button>
                        ))}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (
        <div className="tb__pager">
          <button
            className="tb__pager-btn"
            disabled={safeCurrentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className="tb__pager-info">
            Page {safeCurrentPage} of {totalPages}
            <span className="tb__pager-count">
              {" "}
              ({sorted.length} record{sorted.length !== 1 ? "s" : ""})
            </span>
          </span>
          <button
            className="tb__pager-btn"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
