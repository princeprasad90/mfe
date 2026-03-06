import React, { useEffect, useRef, useState, Component, ReactNode, ErrorInfo } from "react";
import { useShell } from "./ShellContext";
import { useAuth } from "./AuthContext";
import { loadRemoteVite } from "./mfe/loadRemoteVite";
import type { MfeConfig } from "./types";

// Platform event bus with replay — defined once in the shell, injected into every MFE via mount() props.
// Stores the last payload per event name so a newly-mounted MFE can receive
// events that were emitted while it was not on screen (only one MFE at a time).
const lastEventPayloads = new Map<string, unknown>();

const emitEvent = <T,>(event: string, detail: T): void => {
  lastEventPayloads.set(event, detail);          // store for replay
  window.dispatchEvent(new CustomEvent(event, { detail }));
};

const onEvent = <T,>(
  event: string,
  handler: (detail: T) => void
): (() => void) => {
  // Replay the last stored payload immediately so the MFE doesn't miss it
  if (lastEventPayloads.has(event)) {
    // Defer to next micro-task so the component has finished mounting
    Promise.resolve().then(() => handler(lastEventPayloads.get(event) as T));
  }

  const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
  window.addEventListener(event, listener);
  return () => window.removeEventListener(event, listener);
};

// Error Boundary for MFE isolation
type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  mfeName?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class MfeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[MFE Error] ${this.props.mfeName || "Unknown"}:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="mfe-error">
            <div className="mfe-error__icon">⚠️</div>
            <h3>Failed to load {this.props.mfeName || "micro frontend"}</h3>
            <p>{this.state.error?.message}</p>
            <button
              className="mfe-error__retry-btn"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Bootstrap module type
type BootstrapModule = {
  mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
};

// MFE Loader component
function MfeLoader({ config }: { config: MfeConfig }) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unmountRef = useRef<BootstrapModule["unmount"] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const loadMfe = async () => {
      if (!containerRef.current) return;

      setLoading(true);
      setError(null);

      // Cleanup previous MFE
      if (unmountRef.current) {
        try {
          await unmountRef.current();
        } catch (e) {
          console.warn("[MfeLoader] Unmount error:", e);
        }
        unmountRef.current = undefined;
      }

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      try {
        const remoteModule = await loadRemoteVite<BootstrapModule>(
          config.RemoteEntry,
          config.ExposedModule
        );

        if (!isMounted || !containerRef.current) return;

        await remoteModule.mount(containerRef.current, {
          basePath: config.Route,
          routePath: config.Route,
          // Provide the current user and event bus to every MFE via mount() props
          user: user
            ? { id: user.UserId, email: user.Email, displayName: user.DisplayName }
            : undefined,
          emitEvent,
          onEvent,
        });

        unmountRef.current = remoteModule.unmount;
        setLoading(false);
      } catch (err) {
        console.error("[MfeLoader] Failed to load MFE:", config.Name, err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load MFE");
          setLoading(false);
        }
      }
    };

    loadMfe();

    return () => {
      isMounted = false;
      if (unmountRef.current) {
        try {
          const result = unmountRef.current();
          if (result && typeof result.catch === "function") {
            result.catch((e: unknown) =>
              console.warn("[MfeLoader] Cleanup unmount error:", e)
            );
          }
        } catch (e) {
          console.warn("[MfeLoader] Cleanup unmount error:", e);
        }
      }
    };
  }, [config.RemoteEntry, config.ExposedModule, config.Name, config.Route]);

  if (error) {
    return (
      <div className="mfe-error">
        <div className="mfe-error__icon">❌</div>
        <h3>Failed to load {config.Name}</h3>
        <p>{error}</p>
        <p className="mfe-error__url">Remote: {config.RemoteEntry}</p>
      </div>
    );
  }

  return (
    <div className={`mfe-wrapper mfe-wrapper--${config.Scope}`} data-mfe={config.Name}>
      {loading && (
        <div className="mfe-loader">
          <div className="shell__spinner shell__spinner--small" />
          <span>Loading {config.Name}...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="mfe-container"
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}

export default function MfeContainer() {
  const { selectedMenu, getActiveMfeConfig } = useShell();

  const mfeConfig = getActiveMfeConfig();

  if (!selectedMenu) {
    return (
      <div className="mfe-placeholder">
        <div className="mfe-placeholder__icon">🎯</div>
        <h2>Welcome to MFE Shell</h2>
        <p>Select an application, profile, and menu item to get started.</p>
        <div className="mfe-placeholder__steps">
          <div className="mfe-placeholder__step">
            <span className="mfe-placeholder__step-num">1</span>
            <span>Select an Application</span>
          </div>
          <div className="mfe-placeholder__step">
            <span className="mfe-placeholder__step-num">2</span>
            <span>Choose a Profile</span>
          </div>
          <div className="mfe-placeholder__step">
            <span className="mfe-placeholder__step-num">3</span>
            <span>Pick a Menu Item</span>
          </div>
        </div>
      </div>
    );
  }

  if (!mfeConfig) {
    return (
      <div className="mfe-placeholder">
        <div className="mfe-placeholder__icon">📋</div>
        <h2>{selectedMenu.Name}</h2>
        <p>This menu item does not have an associated micro frontend.</p>
      </div>
    );
  }

  return (
    <MfeErrorBoundary mfeName={mfeConfig.Name}>
      <MfeLoader key={`${mfeConfig.Name}-${mfeConfig.RemoteEntry}`} config={mfeConfig} />
    </MfeErrorBoundary>
  );
}
