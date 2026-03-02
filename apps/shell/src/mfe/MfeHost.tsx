import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { loadRemoteVite } from "./loadRemoteVite";
import { useShellStore } from "../stores/shellStore";

type Props = { path: string };

const normalizePath = (value: string) => value.split("?")[0].replace(/\/$/, "") || "/";

const MfeHost = ({ path }: Props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menus = useShellStore((state) => state.menus);
  const manifest = useShellStore((state) => state.mfeManifest);

  useEffect(() => {
    const renderMfe = async () => {
      const normalizedPath = normalizePath(path);
      const menu = menus.find((item) => {
        const menuPath = normalizePath(item.Url);
        return normalizedPath === menuPath || normalizedPath.startsWith(`${menuPath}/`);
      });
      if (!menu || !hostRef.current) {
        const message = "No micro frontend found for this path.";
        console.error("[shell] MFE route did not match any menu", { path, menus });
        setError(message);
        return;
      }

      const config = manifest[menu.MfeConfig.Scope];
      if (!config) {
        const message = "MFE configuration missing in manifest.";
        console.error("[shell] MFE manifest configuration missing", { path, menu, manifest });
        setError(message);
        return;
      }

      try {
        console.info("[shell] Rendering micro frontend", { path, menu, config });
        setError(null);
        const remoteModule = await loadRemoteVite<any>(config.RemoteEntry, config.Scope, config.Module);
        const RemoteComponent = remoteModule.default || remoteModule;

        hostRef.current.innerHTML = "";
        const mountNode = document.createElement("div");
        hostRef.current.appendChild(mountNode);

        rootRef.current?.unmount();
        rootRef.current = createRoot(mountNode);
        rootRef.current.render(<RemoteComponent routePath={path} basePath={menu.Url} />);
      } catch (err) {
        const error = err as Error;
        console.error("[shell] Failed to render micro frontend", { path, menu, config, error });
        setError(`Unable to load micro frontend: ${error.message}. Check browser console for details.`);
      }
    };

    renderMfe();
    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, [path, menus, manifest]);

  if (error) {
    return <p>{error}</p>;
  }

  return <div ref={hostRef} />;
};

export default MfeHost;
