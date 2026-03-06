import React from "react";
import ReactDOM from "react-dom/client";
import CdtsApp from "./CdtsApp";

// Props injected by Shell via mount() — mirrors @mfe/platform-contracts MountProps
type MountProps = {
  basePath?: string;
  routePath?: string;
  user?: { id: string; email: string; displayName: string };
  emitEvent?: <T>(event: string, detail: T) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
};

let root: ReactDOM.Root | null = null;

export function mount(container: HTMLElement, props: MountProps = {}) {
  // Add data-mfe attribute for CSS scoping
  container.setAttribute("data-mfe", "cdts");
  root = ReactDOM.createRoot(container);
  root.render(React.createElement(CdtsApp, props));
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
