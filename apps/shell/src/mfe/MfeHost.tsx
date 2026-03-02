import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { loadRemoteVite } from "./loadRemoteVite";
import { useShellStore } from "../stores/shellStore";

type Props = { path: string };

const injectRemoteCss = async (remoteEntry: string, shadowRoot: ShadowRoot) => {
  const origin = new URL(remoteEntry).origin;
  const candidates = [`${origin}/src/index.css`, `${origin}/dist/assets/index.css`];

  for (const cssUrl of candidates) {
    try {
      const response = await fetch(cssUrl);
      if (!response.ok) {
        continue;
      }
      const cssText = await response.text();
      const styleTag = document.createElement("style");
      styleTag.dataset.mfeCss = cssUrl;
      styleTag.textContent = cssText;
      shadowRoot.appendChild(styleTag);
      return;
    } catch {
      // ignore and try next candidate
    }
  }
};

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

        const shadowRoot = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = "";
        await injectRemoteCss(config.RemoteEntry, shadowRoot);

        const mountNode = document.createElement("div");
        shadowRoot.appendChild(mountNode);

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
