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

export type ShellApplication = {
  id: string;
  title: string;
  description: string;
};

export type ShellProfile = {
  id: string;
  appId: string;
  name: string;
  role: string;
  description: string;
};

type ShellState = {
  selectedAppId: string | null;
  selectedProfileId: string | null;
  applications: ShellApplication[];
  profiles: ShellProfile[];
  menus: MenuItem[];
  mfeManifest: Record<string, MfeConfig>;
  loading: boolean;
  loadApplications: () => Promise<void>;
  selectApp: (appId: string) => Promise<void>;
  clearSelection: () => void;
  clearProfileSelection: () => void;
  fetchMenus: (appId: string, profileId: string) => Promise<void>;
  selectProfile: (appId: string, profileId: string) => Promise<void>;
};

const APP_KEY = "shell_appId";
const PROFILE_KEY = "shell_profileId";
const appCacheKey = "shell_apps";
const profileCacheKey = (appId: string) => `shell_profiles_${appId}`;
const menuCacheKey = (appId: string, profileId: string) => `menu_${appId}_${profileId}`;

const fallbackApplications: ShellApplication[] = [
  { id: "cbms", title: "CBMS", description: "Customer Banking Management System" },
  { id: "cdts", title: "CDTS", description: "Customer Data Tracking System" }
];

const fallbackProfiles: Record<string, ShellProfile[]> = {
  cbms: [
    { id: "cbms-maker", appId: "cbms", name: "Maker", role: "maker", description: "Create and review payment drafts." },
    { id: "cbms-checker", appId: "cbms", name: "Checker", role: "checker", description: "Approve and verify submitted payments." }
  ],
  cdts: [
    { id: "cdts-maker", appId: "cdts", name: "Maker", role: "maker", description: "Prepare customer onboarding tasks." },
    { id: "cdts-checker", appId: "cdts", name: "Checker", role: "checker", description: "Validate and sign off onboarding tasks." }
  ]
};

const fallbackMenusByProfile: Record<string, MenuItem[]> = {
  "cbms-maker": [
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
    }
  ],
  "cbms-checker": [
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
    }
  ],
  "cdts-maker": [
    {
      Id: "2",
      Title: "Tasks",
      Url: "/tasks",
      Sequence: 1,
      MfeConfig: {
        RemoteEntry: "https://mfe-cdts.vercel.app/assets/remoteEntry.js",
        Scope: "cdtsApp",
        Module: "./CdtsApp"
      }
    }
  ],
  "cdts-checker": [
    {
      Id: "2",
      Title: "Tasks",
      Url: "/tasks",
      Sequence: 1,
      MfeConfig: {
        RemoteEntry: "https://mfe-cdts.vercel.app/assets/remoteEntry.js",
        Scope: "cdtsApp",
        Module: "./CdtsApp"
      }
    }
  ]
};

const buildManifest = (menus: MenuItem[]) =>
  menus.reduce<Record<string, MfeConfig>>((acc, menu) => {
    acc[menu.MfeConfig.Scope] = menu.MfeConfig;
    return acc;
  }, {});

export const useShellStore = create<ShellState>((set) => ({
  selectedAppId: localStorage.getItem(APP_KEY),
  selectedProfileId: localStorage.getItem(PROFILE_KEY),
  applications: [],
  profiles: [],
  menus: [],
  mfeManifest: {},
  loading: false,

  loadApplications: async () => {
    set({ loading: true });
    try {
      const cached = sessionStorage.getItem(appCacheKey);
      if (cached) {
        set({ applications: JSON.parse(cached) as ShellApplication[], loading: false });
        return;
      }

      const response = await axios.get<ShellApplication[]>("/shell/apps");
      sessionStorage.setItem(appCacheKey, JSON.stringify(response.data));
      set({ applications: response.data, loading: false });
    } catch {
      sessionStorage.setItem(appCacheKey, JSON.stringify(fallbackApplications));
      set({ applications: fallbackApplications, loading: false });
    }
  },

  selectApp: async (appId) => {
    set({ loading: true, selectedAppId: appId, selectedProfileId: null, menus: [], mfeManifest: {} });
    localStorage.setItem(APP_KEY, appId);
    localStorage.removeItem(PROFILE_KEY);

    const key = profileCacheKey(appId);
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        set({ profiles: JSON.parse(cached) as ShellProfile[], loading: false });
        return;
      }

      const response = await axios.get<ShellProfile[]>(`/shell/apps/${appId}/profiles`);
      sessionStorage.setItem(key, JSON.stringify(response.data));
      set({ profiles: response.data, loading: false });
    } catch {
      const profiles = fallbackProfiles[appId] || [];
      sessionStorage.setItem(key, JSON.stringify(profiles));
      set({ profiles, loading: false });
    }
  },

  clearSelection: () => {
    localStorage.removeItem(APP_KEY);
    localStorage.removeItem(PROFILE_KEY);
    window.location.hash = "#/";
    set({ selectedAppId: null, selectedProfileId: null, profiles: [], menus: [], mfeManifest: {} });
  },

  clearProfileSelection: () => {
    localStorage.removeItem(PROFILE_KEY);
    window.location.hash = "#/";
    set({ selectedProfileId: null, menus: [], mfeManifest: {} });
  },

  fetchMenus: async (appId, profileId) => {
    set({ loading: true });
    const key = menuCacheKey(appId, profileId);

    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const menus = JSON.parse(cached) as MenuItem[];
        set({ menus, mfeManifest: buildManifest(menus), loading: false });
        return;
      }

      const response = await axios.get<MenuItem[]>(`/shell/apps/${appId}/profiles/${profileId}/menus`);
      const menus = [...response.data].sort((a, b) => a.Sequence - b.Sequence);
      sessionStorage.setItem(key, JSON.stringify(menus));
      set({ menus, mfeManifest: buildManifest(menus), loading: false });
    } catch {
      const menus = fallbackMenusByProfile[profileId] || [];
      sessionStorage.setItem(key, JSON.stringify(menus));
      set({ menus, mfeManifest: buildManifest(menus), loading: false });
    }
  },

  selectProfile: async (appId, profileId) => {
    localStorage.setItem(APP_KEY, appId);
    localStorage.setItem(PROFILE_KEY, profileId);
    set({ selectedAppId: appId, selectedProfileId: profileId });
    await useShellStore.getState().fetchMenus(appId, profileId);

    const { menus } = useShellStore.getState();
    const hash = window.location.hash.replace(/^#/, "");
    if ((!hash || hash === "/") && menus.length > 0) {
      window.location.hash = `#${menus[0].Url}`;
    }
  }
}));
