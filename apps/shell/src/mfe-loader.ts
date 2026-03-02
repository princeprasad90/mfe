export const loadRemote = async (remoteName: string, remoteEntry: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[data-remote="${remoteName}"]`)) {
      console.info("[shell] Remote already loaded, skipping script injection", { remoteName, remoteEntry });
      resolve();
      return;
    }

    console.info("[shell] Injecting remoteEntry script", { remoteName, remoteEntry });
    const script = document.createElement("script");
    script.src = remoteEntry;
    script.type = "text/javascript";
    script.async = true;
    script.dataset.remote = remoteName;

    script.onload = () => {
      console.info("[shell] Remote script loaded", { remoteName, remoteEntry });
      resolve();
    };
    script.onerror = () => {
      const error = new Error(`Failed to load remote script for ${remoteName}`);
      console.error("[shell] Remote script failed to load", { remoteName, remoteEntry, error });
      reject(error);
    };

    document.head.appendChild(script);
  });
