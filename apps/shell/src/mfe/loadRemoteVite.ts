type FederatedContainer = {
  get: (module: string) => Promise<() => any>;
  init?: (shareScope: unknown) => Promise<void> | void;
};

const containers = new Map<string, FederatedContainer>();

const getContainer = async (remoteEntry: string): Promise<FederatedContainer> => {
  if (containers.has(remoteEntry)) {
    return containers.get(remoteEntry)!;
  }

  const container = (await import(/* webpackIgnore: true */ remoteEntry)) as FederatedContainer;
  if (!container?.get) {
    throw new Error(`Remote entry at ${remoteEntry} does not expose get()`);
  }

  if (container.init) {
    await container.init({});
  }

  containers.set(remoteEntry, container);
  return container;
};

export const loadRemoteVite = async <TModule = any>(remoteEntry: string, module: string): Promise<TModule> => {
  const container = await getContainer(remoteEntry);
  const moduleFactory = await container.get(module);
  return moduleFactory();
};
