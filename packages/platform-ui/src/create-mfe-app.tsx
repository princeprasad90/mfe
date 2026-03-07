/**
 * @mfe/platform-ui — createMfeApp
 *
 * Factory that eliminates the identical bootstrap.ts boilerplate
 * from every React MFE. Handles createRoot, error boundaries,
 * provider wrapping, and the mount/unmount contract.
 *
 * @example
 * ```ts
 * // apps/cbms/src/bootstrap.ts
 * import { createMfeApp } from "@mfe/platform-ui";
 * import CbmsApp from "./CbmsApp";
 * import "./cbms.css";
 *
 * export const { mount, unmount } = createMfeApp({
 *   name: "cbms",
 *   App: CbmsApp,
 * });
 * ```
 */

import React from "react";
import ReactDOM from "react-dom/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateMfeAppOptions {
  /** MFE identifier — set as data-mfe attribute for CSS scoping */
  name: string;
  /** Root React component. Receives the mount props. */
  App: React.ComponentType<any>;
  /** Custom error fallback UI */
  errorFallback?: (error: Error, retry: () => void) => React.ReactNode;
  /** Providers to wrap around the App (outermost first) */
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
  /** Called after mount */
  onMount?: (props: Record<string, unknown>) => void;
  /** Called before unmount */
  onUnmount?: () => void;
}

export interface MfeBootstrap {
  mount: (container: HTMLElement, props?: Record<string, unknown>) => void;
  unmount: () => void;
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
  mfeName: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MfeAppErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(`[${this.props.mfeName}] Error Boundary:`, error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return React.createElement(
        "div",
        {
          style: {
            padding: 32,
            textAlign: "center" as const,
            color: "#ef4444",
          },
        },
        React.createElement(
          "h3",
          { style: { marginBottom: 8 } },
          `Something went wrong in ${this.props.mfeName}`,
        ),
        React.createElement(
          "p",
          { style: { color: "#64748b", fontSize: 14 } },
          this.state.error.message,
        ),
        React.createElement(
          "button",
          {
            onClick: this.handleRetry,
            style: {
              marginTop: 16,
              padding: "8px 20px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            },
          },
          "Retry",
        ),
      );
    }

    return this.props.children;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createMfeApp(options: CreateMfeAppOptions): MfeBootstrap {
  const {
    name,
    App,
    errorFallback,
    providers = [],
    onMount,
    onUnmount,
  } = options;

  let root: ReactDOM.Root | null = null;

  function mount(
    container: HTMLElement,
    props: Record<string, unknown> = {},
  ): void {
    // Set data-mfe attribute for CSS scoping
    container.setAttribute("data-mfe", name);

    // Build element tree: ErrorBoundary → Providers → App
    let element: React.ReactElement = React.createElement(App, props);

    // Wrap with providers (outermost first: array[0] wraps everything)
    for (let i = providers.length - 1; i >= 0; i--) {
      element = React.createElement(providers[i], null, element);
    }

    // Wrap with error boundary
    element = React.createElement(
      MfeAppErrorBoundary,
      { fallback: errorFallback, mfeName: name, children: element },
    );

    root = ReactDOM.createRoot(container);
    root.render(element);

    onMount?.(props);
  }

  function unmount(): void {
    onUnmount?.();
    if (root) {
      root.unmount();
      root = null;
    }
  }

  return { mount, unmount };
}
