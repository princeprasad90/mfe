/**
 * @mfe/platform-contracts
 *
 * Shared types that the Shell passes to every MFE via mount() props.
 * Keep this file free of MFE-specific types — it is shared across 400+ MFEs.
 */

/** Current authenticated user, forwarded from Shell → MFE via mount() props. */
export type MfeUser = {
  id: string;
  email: string;
  displayName: string;
};

/**
 * Generic event helpers passed into every MFE's mount() call.
 * MFEs use these to communicate through the platform event bus
 * without coupling to window directly or to each other.
 */
export type MfeEventBus = {
  /** Fire a custom event on the platform bus. */
  emitEvent: <T>(event: string, detail: T) => void;
  /** Subscribe to a platform bus event. Returns a cleanup function. */
  onEvent: <T>(event: string, handler: (detail: T) => void) => () => void;
};

/**
 * The full props object that Shell passes to every MFE's mount() function.
 * MFE bootstrap files should type their props against this.
 */
export type MountProps = {
  basePath?: string;
  routePath?: string;
  user?: MfeUser;
} & Partial<MfeEventBus>;
