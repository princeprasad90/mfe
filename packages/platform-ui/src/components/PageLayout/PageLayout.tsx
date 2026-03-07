/**
 * @mfe/platform-ui — PageLayout
 *
 * Standard page wrapper with breadcrumbs, title, toolbar,
 * and built-in loading / error / empty states.
 */

import React from "react";
import "./PageLayout.styles.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Breadcrumb trail */
  breadcrumbs?: Breadcrumb[];
  /** Toolbar / action buttons rendered to the right of the title */
  toolbar?: React.ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Error message or Error object */
  error?: string | Error | null;
  /** Show empty state (only when !loading and !error) */
  empty?: boolean;
  /** Emoji for the empty state */
  emptyIcon?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Retry button handler (shown on error) */
  onRetry?: () => void;
  /** Navigation function for breadcrumb links */
  navigate?: (path: string) => void;
  /** Content to render in the main area */
  children: React.ReactNode;
  /** Extra CSS class */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  toolbar,
  loading,
  error,
  empty,
  emptyIcon = "📋",
  emptyMessage = "No data found.",
  onRetry,
  navigate,
  children,
  className,
}) => {
  const errorMsg = error instanceof Error ? error.message : error;

  return (
    <div className={`page-layout ${className ?? ""}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-layout__breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className="page-layout__breadcrumb-sep" aria-hidden="true">
                  ›
                </span>
              )}
              {crumb.path && navigate ? (
                <a
                  className="page-layout__breadcrumb-link"
                  href={crumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path!);
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="page-layout__breadcrumb-current">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="page-layout__header">
        <div className="page-layout__title-group">
          <h2 className="page-layout__title">{title}</h2>
          {subtitle && <p className="page-layout__subtitle">{subtitle}</p>}
        </div>
        {toolbar && <div className="page-layout__toolbar">{toolbar}</div>}
      </div>

      {/* Content area */}
      <div className="page-layout__content">
        {loading ? (
          <div className="page-layout__loading">
            <div className="page-layout__spinner" />
            <span>Loading…</span>
          </div>
        ) : errorMsg ? (
          <div className="page-layout__error">
            <span className="page-layout__error-icon">⚠️</span>
            <p>{errorMsg}</p>
            {onRetry && (
              <button className="page-layout__retry-btn" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        ) : empty ? (
          <div className="page-layout__empty">
            <span className="page-layout__empty-icon">{emptyIcon}</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
