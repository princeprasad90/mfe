import React from "react";
import ReactDOM from "react-dom/client";
import CdtsApp from "./CdtsApp";

type MountProps = {
  routePath?: string;
  basePath?: string;
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
