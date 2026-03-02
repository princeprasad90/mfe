import React, { useEffect, useState } from "react";
import { loadRemote } from "./mfe-loader";

type Props = {
  name: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
};

const resolveRemoteModule = async (scope: string, exposedModule: string) => {
  const webpackGlobal = window as Window & {
    [key: string]: any;
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
  };

  const container = webpackGlobal[scope];

  if (!container?.get) {
    throw new Error(`Remote container '${scope}' is not available on window.`);
  }

  if (typeof webpackGlobal.__webpack_init_sharing__ === "function") {
    await webpackGlobal.__webpack_init_sharing__("default");
  }

  const shareScope = (globalThis as any).__webpack_share_scopes__?.default;
  if (container.init && shareScope) {
    await container.init(shareScope);
  }

  const factory = await container.get(exposedModule);
  const module = factory();
  return module.default || module;
};

export default function RemoteComponent({ name, remoteEntry, scope, exposedModule }: Props) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        console.info("[shell] Loading remote component", { name, scope, remoteEntry, exposedModule });
        setError(null);
        await loadRemote(name, remoteEntry);
        const remoteModule = await resolveRemoteModule(scope, exposedModule);

        if (mounted) {
          console.info("[shell] Remote component resolved", { name, scope, exposedModule });
          setComponent(() => remoteModule);
        }
      } catch (loadError) {
        console.error("[shell] Remote component failed", { name, scope, remoteEntry, exposedModule, loadError });
        if (mounted) {
          setError(`Unable to load ${name}. Check console logs for details.`);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [name, scope, remoteEntry, exposedModule]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!Component) {
    return <div>Loading MFE...</div>;
  }

  return <Component />;
}
