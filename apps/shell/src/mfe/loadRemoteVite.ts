type RemoteContainer = {
  get: (module: string) => Promise<() => any>;
  init?: (...args: any[]) => Promise<void> | void;
};

const importRemoteModule = (remoteEntry: string) => import(/* webpackIgnore: true */ remoteEntry);

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
    script.onload = () => {
      console.info("[shell] Remote entry script loaded", { scope, remoteEntry });
      resolve();
    };
    script.onerror = () => {
      const error = new Error(`Failed to load ${scope} from ${remoteEntry}`);
      console.error("[shell] Remote entry script failed", { scope, remoteEntry, error });
      reject(error);
    };
    document.head.appendChild(script);
  });

  remotePromises.set(remoteEntry, scriptPromise);
  return scriptPromise;
};

export const loadRemoteVite = async <TModule = any>(remoteEntry: string, scope: string, module: string): Promise<TModule> => {
  console.info("[shell] Loading remote module", { scope, module, remoteEntry });
  await loadScript(remoteEntry, scope);

  let container = remoteContainers.get(remoteEntry) || (window as any)[scope];
  if (!container?.get) {
    console.warn("[shell] Container not found on window after script load, trying dynamic import", { scope, remoteEntry });
    const imported = await importRemoteModule(remoteEntry);
    if (imported?.get) {
      container = imported as RemoteContainer;
      remoteContainers.set(remoteEntry, container);
      (window as any)[scope] = container;
    }
  }

  if (!container?.get) {
    console.error("[shell] Remote container missing get()", { scope, remoteEntry, windowContainer: (window as any)[scope] });
    throw new Error(`Remote container ${scope} is not available on window`);
  }

  if (typeof (globalThis as any).__webpack_init_sharing__ === "function") {
    await (globalThis as any).__webpack_init_sharing__("default");
  }

  const shareScope = (globalThis as any).__webpack_share_scopes__?.default ?? {};
  if (container.init) {
    await container.init(shareScope);
  }

  const moduleFactory = await container.get(module);
  console.info("[shell] Remote module factory resolved", { scope, module, remoteEntry });
  return moduleFactory();
};
