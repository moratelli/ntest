import type { BoardState } from "../engine/types";

const DB_NAME = "game-of-life-db";
const DB_VERSION = 1;
const STORE_NAME = "boards";

export interface PersistedState {
  sessionId: string;
  state: BoardState;
  generation: number;
  timestamp: number;
  gridState?: {
    panX: number;
    panY: number;
    zoom: number;
  };
}

/**
 * IndexedDB adapter for persisting Game of Life board states.
 * Provides fallback to localStorage if IndexedDB is unavailable.
 */
export class IndexedDBAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "sessionId" });
        }
      };
    });

    return this.dbPromise;
  }

  public async save(data: PersistedState): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(data);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn(
        "IndexedDB unavailable, falling back to localStorage",
        error
      );
      localStorage.setItem(`gol-${data.sessionId}`, JSON.stringify(data));
    }
  }

  public async load(sessionId: string): Promise<PersistedState | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(sessionId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn(
        "IndexedDB unavailable, falling back to localStorage",
        error
      );
      const data = localStorage.getItem(`gol-${sessionId}`);
      return data ? JSON.parse(data) : null;
    }
  }

  public async loadLatest(): Promise<PersistedState | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const all = request.result as PersistedState[];
          if (all.length === 0) {
            resolve(null);
            return;
          }
          // Find the entry with the highest timestamp
          const latest = all.reduce((max, current) =>
            current.timestamp > max.timestamp ? current : max
          );
          resolve(latest);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn(
        "IndexedDB unavailable, falling back to localStorage",
        error
      );
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("gol-")
      );
      if (keys.length === 0) return null;

      const latestKey = keys
        .map((key) => ({
          key,
          data: JSON.parse(localStorage.getItem(key)!) as PersistedState,
        }))
        .sort((a, b) => b.data.timestamp - a.data.timestamp)[0];

      return latestKey.data;
    }
  }

  public async delete(sessionId: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(sessionId);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn(
        "IndexedDB unavailable, falling back to localStorage",
        error
      );
      localStorage.removeItem(`gol-${sessionId}`);
    }
  }

  public async deleteAll(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn(
        "IndexedDB unavailable, falling back to localStorage",
        error
      );
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("gol-")
      );
      keys.forEach((key) => localStorage.removeItem(key));
    }
  }
}
