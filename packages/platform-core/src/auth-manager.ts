/**
 * @mfe/platform-core — AuthManager
 *
 * Manages the authenticated user session.
 * The Shell initialises auth state; MFEs read it via `authManager.getUser()`.
 */

import { tokenManager, type DecodedToken } from "./token-manager";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
}

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthListener = (state: AuthState) => void;

export class AuthManager {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };
  private listeners = new Set<AuthListener>();

  // ── State access ────────────────────────────────────────────────────────

  getState(): Readonly<AuthState> {
    return this.state;
  }

  getUser(): AuthUser | null {
    return this.state.user;
  }

  get isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  // ── State mutation ──────────────────────────────────────────────────────

  /** Called by the Shell after login / token refresh. */
  setUser(user: AuthUser | null): void {
    this.state = {
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    };
    this.notify();
  }

  /** Hydrate user from the current access token (JWT decode). */
  hydrateFromToken(): void {
    const decoded: DecodedToken | null = tokenManager.decode();
    if (decoded && !tokenManager.isExpired()) {
      this.setUser({
        id: decoded.sub,
        email: decoded.email ?? "",
        displayName: decoded.name ?? decoded.email ?? decoded.sub,
        roles: decoded.roles ?? [],
      });
    } else {
      this.setUser(null);
    }
  }

  /** Clear session (logout). */
  logout(): void {
    tokenManager.clear();
    this.setUser(null);
  }

  // ── Subscribe ───────────────────────────────────────────────────────────

  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l(this.state);
      } catch (err) {
        console.error("[AuthManager] Listener error:", err);
      }
    });
  }
}

/** Singleton instance. */
export const authManager = new AuthManager();
