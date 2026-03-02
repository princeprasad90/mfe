import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { loadRemoteVite } from "./loadRemoteVite";
import { useShellStore } from "../stores/shellStore";

type Props = { path: string };

const MfeHost = ({ path }: Props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menus = useShellStore((state) => state.menus);
  const manifest = useShellStore((state) => state.mfeManifest);

  useEffect(() => {
    const renderMfe = async () => {
      const menu = menus.find((item) => path === item.Url || path.startsWith(`${item.Url}/`));
      if (!menu || !hostRef.current) {
        setError("No micro frontend found for this path.");
        return;
      }

      const config = manifest[menu.MfeConfig.Scope];
      if (!config) {
        setError("MFE configuration missing in manifest.");
        return;
      }

      try {
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
        setError((err as Error).message);
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
