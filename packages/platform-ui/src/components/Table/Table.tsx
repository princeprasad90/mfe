import React from "react";
import "./Table.styles.css";

// ── Column definition ─────────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  striped?: boolean;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  striped = false,
  onRowClick,
  emptyMessage = "No data available.",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`pui-table-wrapper ${className}`}>
      <table className={`pui-table ${striped ? "pui-table--striped" : ""}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width, textAlign: col.align ?? "left" }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "24px", color: "var(--pui-text-muted)" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={rowKey(row, idx)}
                onClick={() => onRowClick?.(row, idx)}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align ?? "left" }}>
                    {col.render ? col.render(row, idx) : String((row as any)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
