import { useEffect, useRef, useState } from "react";
import type { MfeScope } from "./mfe-config";
import { loadRemoteModule } from "./mfe/loadRemoteModule";

type Props = {
  name: string;
  scope: MfeScope;
};

export default function RemoteComponent({ name, scope }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let remoteUnmount: (() => void | Promise<void>) | undefined;

    const load = async () => {
      try {
        setError(null);
        const container = hostRef.current;

        if (!container) {
          return;
        }

        const remoteModule = await loadRemoteModule(scope);
        await remoteModule.mount(container);
        remoteUnmount = remoteModule.unmount;
      } catch (loadError) {
        console.error("[shell] Remote component failed", { name, scope, loadError });
        setError(`Unable to load ${name}. Check console logs for details.`);
      }
    };

    void load();

    return () => {
      void remoteUnmount?.();
    };
  }, [name, scope]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div id="mfe-root" ref={hostRef}>Loading MFE...</div>;
}
