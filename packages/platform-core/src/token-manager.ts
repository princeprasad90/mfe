/**
 * @mfe/platform-core — TokenManager
 *
 * Manages JWT access/refresh tokens in memory (not localStorage for security).
 * The Shell sets tokens after login; MFEs read them via ApiClient.
 */

export interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // ── Access token ────────────────────────────────────────────────────────

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // ── Refresh token ───────────────────────────────────────────────────────

  setRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Decode JWT payload without verification (client-side only). */
  decode(token?: string): DecodedToken | null {
    const raw = token ?? this.accessToken;
    if (!raw) return null;

    try {
      const parts = raw.split(".");
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(payload)) as DecodedToken;
    } catch {
      return null;
    }
  }

  /** Check if the current access token has expired (with optional buffer). */
  isExpired(bufferSeconds = 30): boolean {
    const decoded = this.decode();
    if (!decoded?.exp) return true;
    return Date.now() / 1000 > decoded.exp - bufferSeconds;
  }

  /** Clear both tokens (logout). */
  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

/** Singleton instance. */
export const tokenManager = new TokenManager();
