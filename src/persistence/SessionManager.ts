import { IndexedDBAdapter, type PersistedState } from "./IndexedDBAdapter";

/**
 * Manages session persistence with debounced auto-save.
 * Handles save/load operations and restoration on application mount.
 */
export class SessionManager {
  private adapter: IndexedDBAdapter;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly defaultDebounceMs = 500;

  constructor() {
    this.adapter = new IndexedDBAdapter();
  }

  public scheduleSave(data: PersistedState, debounceMs?: number): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.adapter.save(data).catch((error) => {
        console.error("Failed to save session:", error);
      });
    }, debounceMs ?? this.defaultDebounceMs);
  }

  public async saveNow(data: PersistedState): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    return this.adapter.save(data);
  }

  public async loadSession(sessionId: string): Promise<PersistedState | null> {
    return this.adapter.load(sessionId);
  }

  public async loadLatestSession(): Promise<PersistedState | null> {
    return this.adapter.loadLatest();
  }

  public async deleteSession(sessionId: string): Promise<void> {
    return this.adapter.delete(sessionId);
  }

  public async deleteAllSessions(): Promise<void> {
    return this.adapter.deleteAll();
  }

  public cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}

export const sessionManager = new SessionManager();
