import { createMfeApp } from "@mfe/platform-ui";
import CbmsApp from "./CbmsApp";
import "./cbms.css";

export const { mount, unmount } = createMfeApp({
  name: "cbms",
  App: CbmsApp,
});
