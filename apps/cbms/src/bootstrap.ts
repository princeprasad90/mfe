import React from "react";
import ReactDOM from "react-dom/client";
import CbmsApp from "./CbmsApp";

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
  container.setAttribute("data-mfe", "cbms");
  root = ReactDOM.createRoot(container);
  root.render(React.createElement(CbmsApp, props));
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
