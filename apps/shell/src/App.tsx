import React, { useEffect, useMemo, useState } from "react";
import { bootstrapShell } from "./bootstrap/bootstrapShell";
import ShellLayout from "./layout/ShellLayout";

const getCurrentPath = () => {
  const hashPath = window.location.hash.replace(/^#/, "") || "/";
  return hashPath.startsWith("/") ? hashPath : `/${hashPath}`;
};

const App = () => {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    bootstrapShell();
  }, []);

  useEffect(() => {
    const onHashChange = () => setPath(getCurrentPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const normalizedPath = useMemo(() => path, [path]);
  return <ShellLayout path={normalizedPath} />;
};

export default App;
