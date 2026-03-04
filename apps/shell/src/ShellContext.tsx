import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  ShellState,
  Application,
  Profile,
  MenuItem,
  MfeConfig,
} from "./types";
import { shellApi } from "./api";

type ShellContextType = ShellState & {
  loadApplications: () => Promise<void>;
  selectApplication: (app: Application) => Promise<void>;
  selectProfile: (profile: Profile) => Promise<void>;
  selectMenu: (menu: MenuItem) => void;
  getActiveMfeConfig: () => MfeConfig | null;
  goBack: () => void;
  restoreFromUrl: () => Promise<void>;
};

const ShellContext = createContext<ShellContextType | null>(null);

export const useShell = (): ShellContextType => {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
};

type ShellProviderProps = {
  children: ReactNode;
};

export const ShellProvider: React.FC<ShellProviderProps> = ({ children }) => {
  const [state, setState] = useState<ShellState>({
    applications: [],
    profiles: [],
    menuItems: [],
    selectedApplication: null,
    selectedProfile: null,
    selectedMenu: null,
    isLoading: false,
    error: null,
  });

  const loadApplications = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const applications = await shellApi.getApplications();
      setState((prev) => ({
        ...prev,
        applications,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load applications",
      }));
    }
  }, []);

  const selectApplication = useCallback(async (app: Application) => {
    setState((prev) => ({
      ...prev,
      selectedApplication: app,
      selectedProfile: null,
      selectedMenu: null,
      profiles: [],
      menuItems: [],
      isLoading: true,
      error: null,
    }));

    try {
      const profiles = await shellApi.getProfiles(app.Id);
      setState((prev) => ({
        ...prev,
        profiles,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load profiles",
      }));
    }
  }, []);

  const selectProfile = useCallback(
    async (profile: Profile) => {
      if (!state.selectedApplication) return;

      setState((prev) => ({
        ...prev,
        selectedProfile: profile,
        selectedMenu: null,
        menuItems: [],
        isLoading: true,
        error: null,
      }));

      try {
        const menuItems = await shellApi.getMenus(
          state.selectedApplication.Id,
          profile.Id
        );
        setState((prev) => ({
          ...prev,
          menuItems,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load menus",
        }));
      }
    },
    [state.selectedApplication]
  );

  const selectMenu = useCallback((menu: MenuItem) => {
    // Update URL to MFE route
    if (menu.MfeConfig?.Route) {
      window.history.pushState({}, "", menu.MfeConfig.Route);
    }
    setState((prev) => ({
      ...prev,
      selectedMenu: menu,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      // If menu is selected, clear menu selection
      if (prev.selectedMenu) {
        window.history.pushState({}, "", "/");
        return { ...prev, selectedMenu: null };
      }
      // If profile is selected, clear profile and menu selection
      if (prev.selectedProfile) {
        return {
          ...prev,
          selectedProfile: null,
          selectedMenu: null,
          menuItems: [],
        };
      }
      // If app is selected, clear everything
      if (prev.selectedApplication) {
        return {
          ...prev,
          selectedApplication: null,
          selectedProfile: null,
          selectedMenu: null,
          profiles: [],
          menuItems: [],
        };
      }
      return prev;
    });
  }, []);

  const restoreFromUrl = useCallback(async () => {
    const currentPath = window.location.pathname;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Get all applications
      const apps = await shellApi.getApplications();
      
      // If at root, just load apps
      if (currentPath === "/" || currentPath === "") {
        setState((prev) => ({
          ...prev,
          applications: apps,
          isLoading: false,
        }));
        return;
      }
      
      // Search through all apps/profiles/menus to find matching route
      for (const app of apps) {
        const profiles = await shellApi.getProfiles(app.Id);
        
        for (const profile of profiles) {
          const menus = await shellApi.getMenus(app.Id, profile.Id);
          
          // Find menu whose route matches (or is prefix of) current path
          const matchingMenu = menus.find((menu: MenuItem) => {
            const route = menu.MfeConfig?.Route;
            return route && currentPath.startsWith(route);
          });
          
          if (matchingMenu) {
            setState({
              applications: apps,
              profiles,
              menuItems: menus,
              selectedApplication: app,
              selectedProfile: profile,
              selectedMenu: matchingMenu,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
      }
      
      // No match found, just load apps
      setState((prev) => ({
        ...prev,
        applications: apps,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to restore state",
      }));
    }
  }, []);

  const getActiveMfeConfig = useCallback((): MfeConfig | null => {
    return state.selectedMenu?.MfeConfig ?? null;
  }, [state.selectedMenu]);

  return (
    <ShellContext.Provider
      value={{
        ...state,
        loadApplications,
        selectApplication,
        selectProfile,
        selectMenu,
        getActiveMfeConfig,
        goBack,
        restoreFromUrl,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};
