import React from "react";
import { createRoot } from "react-dom/client";
import CbmsApp from "./CbmsApp";
import "./cbms.css";

const root = createRoot(document.getElementById("root"));
root.render(<CbmsApp />);
