import type { User, Application, Profile, MenuItem } from "./types";

const BFF_URL = import.meta.env.VITE_BFF_URL || "http://localhost:5001";

// Custom API Error with status code
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
}

// Core fetch wrapper
const api = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${BFF_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Base64 encode returnUrl to avoid IIS blocking :// in query strings
    const returnUrl = btoa(window.location.href);
    window.location.href = `${BFF_URL}/auth/login?returnUrl=${returnUrl}`;
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${response.status} ${response.statusText}`,
    );
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};

// Auth API
export const authApi = {
  me: () => api<User>("/auth/me"),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  // Base64 encode returnUrl to avoid IIS blocking :// in query strings
  loginUrl: (returnUrl = window.location.href) =>
    `${BFF_URL}/auth/login?returnUrl=${btoa(returnUrl)}`,
};

// Shell API
export const shellApi = {
  getApplications: () => api<Application[]>("/shell/apps"),
  getProfiles: (appId: string) =>
    api<Profile[]>(`/shell/apps/${appId}/profiles`),
  getMenus: (appId: string, profileId: string) =>
    api<MenuItem[]>(`/shell/apps/${appId}/profiles/${profileId}/menus`),
};
