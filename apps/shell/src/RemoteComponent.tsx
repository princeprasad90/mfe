import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadRemoteVite } from "./mfe/loadRemoteVite";

type Props = {
  name: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
  basePath: string;
};

type BootstrapModule = {
  mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
};

export default function RemoteComponent({ name, remoteEntry, scope, exposedModule, basePath }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const routePath = `${location.pathname}${location.search}`;

  useEffect(() => {
    let remoteUnmount: BootstrapModule["unmount"] | undefined;

    const load = async () => {
      try {
        setError(null);
        if (!hostRef.current) {
          return;
        }

        const remoteModule = await loadRemoteVite<BootstrapModule>(remoteEntry, exposedModule);
        await remoteModule.mount(hostRef.current, {
          routePath,
          basePath
        });
        remoteUnmount = remoteModule.unmount;
      } catch (loadError) {
        console.error("[shell] Remote component failed", { name, scope, remoteEntry, exposedModule, loadError });
        setError(`Unable to load ${name}. Check console logs for details.`);
      }
    };

    load();

    return () => {
      void remoteUnmount?.();
    };
  }, [name, scope, remoteEntry, exposedModule, routePath, basePath]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div id="mfe-root" ref={hostRef}>Loading MFE...</div>;
}
