import { create } from "zustand";

interface LoadingStore {
  loaders: Set<string>;
  isLoading: boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clear: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loaders: new Set(),
  isLoading: false,
  startLoading: (key) =>
    set((state) => {
      const newLoaders = new Set(state.loaders);
      newLoaders.add(key);
      return { loaders: newLoaders, isLoading: true };
    }),
  stopLoading: (key) =>
    set((state) => {
      const newLoaders = new Set(state.loaders);
      newLoaders.delete(key);
      return { loaders: newLoaders, isLoading: newLoaders.size > 0 };
    }),
  clear: () => set({ loaders: new Set(), isLoading: false }),
}));
