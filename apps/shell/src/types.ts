// API Types
export type User = {
  DisplayName: string;
  WindowsId: string;
  Email: string;
};

export type Application = {
  Id: string;
  Name: string;
  Description: string;
  Icon?: string;
};

export type Profile = {
  Id: string;
  Name: string;
  Description: string;
};

export type MfeConfig = {
  Name: string;
  RemoteEntry: string;
  Scope: string;
  ExposedModule: string;
  Route: string;
};

export type MenuItem = {
  Id: string;
  Name: string;
  Icon?: string;
  Order: number;
  MfeConfig?: MfeConfig;
};

// Auth State
export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
};

// Shell State
export type ShellState = {
  applications: Application[];
  profiles: Profile[];
  menuItems: MenuItem[];
  selectedApplication: Application | null;
  selectedProfile: Profile | null;
  selectedMenu: MenuItem | null;
  isLoading: boolean;
  error: string | null;
};
