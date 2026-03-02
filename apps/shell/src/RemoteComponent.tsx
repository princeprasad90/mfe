import React, { useEffect, useState } from "react";
import { loadRemoteVite } from "./mfe/loadRemoteVite";

type Props = {
  name: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
};

const resolveRemoteModule = async (remoteEntry: string, scope: string, exposedModule: string) => {
  const module = await loadRemoteVite(remoteEntry, scope, exposedModule);
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
        const remoteModule = await resolveRemoteModule(remoteEntry, scope, exposedModule);

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
