type FederatedContainer = {
  get: (module: string) => Promise<() => any>;
  init?: (shareScope: unknown) => Promise<void> | void;
};

const containerCache = new Map<string, Promise<FederatedContainer>>();

const toContainer = (remoteNamespace: unknown, remoteEntry: string): FederatedContainer => {
  const maybeContainer = remoteNamespace as Partial<FederatedContainer> & {
    default?: Partial<FederatedContainer>;
  };

  const container = (maybeContainer?.get ? maybeContainer : maybeContainer?.default) as Partial<FederatedContainer> | undefined;
  if (!container?.get) {
    throw new Error(
      `Hybrid runtime detected for ${remoteEntry}. Expected a Vite federation container exposing get().`
    );
  }

  return container as FederatedContainer;
};

const getContainer = async (remoteEntry: string): Promise<FederatedContainer> => {
  if (!remoteEntry.includes("/assets/remoteEntry.js")) {
    throw new Error(
      `Invalid remoteEntry for ${remoteEntry}. All MFEs must publish /assets/remoteEntry.js from Vite federation builds.`
    );
  }

  if (!containerCache.has(remoteEntry)) {
    containerCache.set(
      remoteEntry,
      (async () => {
        const remoteNamespace = await import(/* @vite-ignore */ remoteEntry);
        const container = toContainer(remoteNamespace, remoteEntry);
        try {
          await container.init?.({});
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (!message.includes("already initialized")) {
            throw error;
          }
        }
        return container;
      })()
    );
  }

  return containerCache.get(remoteEntry)!;
};

export const loadRemoteVite = async <TModule = any>(remoteEntry: string, module: string): Promise<TModule> => {
  const container = await getContainer(remoteEntry);
  const moduleFactory = await container.get(module);
  return moduleFactory();
};
