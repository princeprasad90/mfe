import type { User, Application, Profile, MenuItem } from "./types";

const BFF_URL = import.meta.env.VITE_BFF_URL || "http://localhost:5001";
const AUTH_LOGIN_URL =
  import.meta.env.VITE_AUTH_LOGIN_URL || `${BFF_URL}/auth/login`;

// Helper for fetch with credentials
const fetchWithAuth = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${BFF_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    // Redirect to login with current URL as return
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${AUTH_LOGIN_URL}?returnUrl=${returnUrl}`;
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Auth APIs
export const authApi = {
  getMe: async (): Promise<User> => {
    return fetchWithAuth<User>("/auth/me");
  },

  logout: async (): Promise<void> => {
    await fetchWithAuth("/auth/logout", { method: "POST" });
  },

  getLoginUrl: (returnUrl?: string): string => {
    const url = returnUrl || window.location.href;
    return `${AUTH_LOGIN_URL}?returnUrl=${encodeURIComponent(url)}`;
  },
};

// Shell APIs
export const shellApi = {
  getApplications: async (): Promise<Application[]> => {
    return fetchWithAuth<Application[]>("/shell/apps");
  },

  getProfiles: async (appId: string): Promise<Profile[]> => {
    return fetchWithAuth<Profile[]>(`/shell/apps/${appId}/profiles`);
  },

  getMenus: async (appId: string, profileId: string): Promise<MenuItem[]> => {
    return fetchWithAuth<MenuItem[]>(
      `/shell/apps/${appId}/profiles/${profileId}/menus`,
    );
  },

  resolveMfe: async (config: {
    RemoteEntry: string;
    Scope: string;
    ExposedModule: string;
  }) => {
    return fetchWithAuth("/shell/mfes/resolve", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },
};
