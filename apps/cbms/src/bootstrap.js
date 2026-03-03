import React from "react";
import ReactDOM from "react-dom/client";
import CbmsApp from "./CbmsApp";

let root = null;

export function mount(container, props = {}) {
  root = ReactDOM.createRoot(container);
  root.render(React.createElement(CbmsApp, props));
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
