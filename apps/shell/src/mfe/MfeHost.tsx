import React, { useEffect, useRef, useState } from "react";
import { loadRemoteVite } from "./loadRemoteVite";
import { useShellStore } from "../stores/shellStore";

type Props = { path: string };

type BootstrapModule = {
  mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
};

const normalizePath = (value: string) => value.split("?")[0].replace(/\/$/, "") || "/";

const MfeHost = ({ path }: Props) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const unmountRef = useRef<BootstrapModule["unmount"] | null>(null);
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
        await unmountRef.current?.();
        unmountRef.current = null;

        const remoteModule = await loadRemoteVite<BootstrapModule>(config.RemoteEntry, config.Module);

        hostRef.current.innerHTML = "";
        const mountNode = document.createElement("div");
        hostRef.current.appendChild(mountNode);

        await remoteModule.mount(mountNode, { routePath: path, basePath: menu.Url });
        unmountRef.current = remoteModule.unmount ?? null;
      } catch (err) {
        const loadError = err as Error;
        setError(`Unable to load micro frontend: ${loadError.message}`);
      }
    };

    renderMfe();

    return () => {
      void unmountRef.current?.();
      unmountRef.current = null;
    };
  }, [path, menus, manifest]);

  if (error) {
    return <p>{error}</p>;
  }

  return <div id="mfe-root" ref={hostRef} />;
};

export default MfeHost;
