import React from "react";
import ReactDOM from "react-dom/client";
import CdtsApp from "./CdtsApp";

let root = null;

export function mount(container, props = {}) {
  root = ReactDOM.createRoot(container);
  root.render(React.createElement(CdtsApp, props));
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
