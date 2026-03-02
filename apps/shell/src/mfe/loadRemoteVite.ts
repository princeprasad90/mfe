type RemoteContainer = {
  get: (module: string) => Promise<() => any>;
  init?: (...args: any[]) => Promise<void> | void;
};

const remotePromises = new Map<string, Promise<void>>();
const remoteContainers = new Map<string, RemoteContainer>();

const loadScript = (remoteEntry: string, scope: string) => {
  if (remotePromises.has(remoteEntry)) {
    return remotePromises.get(remoteEntry)!;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[data-remote-entry="${remoteEntry}"]`);
  if (existingScript) {
    const ready = Promise.resolve();
    remotePromises.set(remoteEntry, ready);
    return ready;
  }

  const scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = remoteEntry;
    script.dataset.remoteEntry = remoteEntry;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${scope} from ${remoteEntry}`));
    document.head.appendChild(script);
  });

  remotePromises.set(remoteEntry, scriptPromise);
  return scriptPromise;
};

export const loadRemoteVite = async <TModule = any>(remoteEntry: string, scope: string, module: string): Promise<TModule> => {
  await loadScript(remoteEntry, scope);

  let container = remoteContainers.get(remoteEntry) || (window as any)[scope];
  if (!container?.get) {
    const imported = await import(/* @vite-ignore */ remoteEntry);
    if (imported?.get) {
      container = imported as RemoteContainer;
      remoteContainers.set(remoteEntry, container);
      (window as any)[scope] = container;
    }
  }

  if (!container?.get) {
    throw new Error(`Remote container ${scope} is not available on window`);
  }

  const moduleFactory = await container.get(module);
  return moduleFactory();
};
