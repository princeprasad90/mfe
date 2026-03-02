import axios from "axios";
import { create } from "zustand";

export type MfeConfig = {
  RemoteEntry: string;
  Scope: string;
  Module: string;
};

export type MenuItem = {
  Id: string;
  Title: string;
  Url: string;
  Sequence: number;
  MfeConfig: MfeConfig;
};

type ShellState = {
  selectedAppId: string | null;
  selectedProfileId: string | null;
  menus: MenuItem[];
  mfeManifest: Record<string, MfeConfig>;
  loading: boolean;
  fetchMenus: (appId: string, profileId: string) => Promise<void>;
  selectProfile: (appId: string, profileId: string) => Promise<void>;
};

const APP_KEY = "shell_appId";
const PROFILE_KEY = "shell_profileId";
const cacheKey = (appId: string, profileId: string) => `menu_${appId}_${profileId}`;

const normalizeRemoteEntry = (remoteEntry: string) => {
  const trimmed = remoteEntry.trim();
  if (trimmed.endsWith("/remoteEntry.js") && !trimmed.includes("/assets/")) {
    return trimmed.replace(/\/remoteEntry\.js$/, "/assets/remoteEntry.js");
  }
  return trimmed;
};

const normalizeMenus = (menus: MenuItem[]) =>
  menus.map((menu) => ({
    ...menu,
    MfeConfig: {
      ...menu.MfeConfig,
      RemoteEntry: normalizeRemoteEntry(menu.MfeConfig.RemoteEntry)
    }
  }));

const defaultMenus: MenuItem[] = [
  {
    Id: "1",
    Title: "Payments",
    Url: "/payments",
    Sequence: 1,
    MfeConfig: {
      RemoteEntry: "https://mfe-cbms.vercel.app/assets/remoteEntry.js",
      Scope: "cbmsApp",
      Module: "./CbmsApp"
    }
  },
  {
    Id: "2",
    Title: "Tasks",
    Url: "/tasks",
    Sequence: 2,
    MfeConfig: {
      RemoteEntry: "https://mfe-cdts.vercel.app/assets/remoteEntry.js",
      Scope: "cdtsApp",
      Module: "./CdtsApp"
    }
  }
];

const buildManifest = (menus: MenuItem[]) =>
  menus.reduce<Record<string, MfeConfig>>((acc, menu) => {
    acc[menu.MfeConfig.Scope] = menu.MfeConfig;
    return acc;
  }, {});

export const useShellStore = create<ShellState>((set) => ({
  selectedAppId: localStorage.getItem(APP_KEY),
  selectedProfileId: localStorage.getItem(PROFILE_KEY),
  menus: [],
  mfeManifest: {},
  loading: false,
  fetchMenus: async (appId, profileId) => {
    set({ loading: true });
    const menuStorageKey = cacheKey(appId, profileId);

    try {
      const cached = sessionStorage.getItem(menuStorageKey);
      if (cached) {
        const menus = normalizeMenus(JSON.parse(cached) as MenuItem[]);
        set({ menus, mfeManifest: buildManifest(menus), loading: false });
        return;
      }

      const response = await axios.get<MenuItem[]>(`/shell/apps/${appId}/profiles/${profileId}/menus`);
      const menus = normalizeMenus([...response.data].sort((a, b) => a.Sequence - b.Sequence));
      sessionStorage.setItem(menuStorageKey, JSON.stringify(menus));
      set({ menus, mfeManifest: buildManifest(menus), loading: false });
    } catch (error) {
      console.error("[shell] Falling back to default menus because menu API failed", {
        appId,
        profileId,
        error
      });
      const menus = normalizeMenus(defaultMenus);
      sessionStorage.setItem(menuStorageKey, JSON.stringify(menus));
      set({ menus, mfeManifest: buildManifest(menus), loading: false });
    }
  },
  selectProfile: async (appId, profileId) => {
    localStorage.setItem(APP_KEY, appId);
    localStorage.setItem(PROFILE_KEY, profileId);
    set({ selectedAppId: appId, selectedProfileId: profileId });
    await useShellStore.getState().fetchMenus(appId, profileId);
  }
}));
