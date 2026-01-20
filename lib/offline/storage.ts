// Sistema de armazenamento offline usando IndexedDB via LocalForage
import { Research, DataCollection } from "@/lib/types/database";

const DB_NAME = "research_app_offline";
const DB_VERSION = 2;
const RESEARCH_STORE = "research";
const DATA_STORE = "data_collection";
const SYNC_QUEUE_STORE = "sync_queue";

// Interface para fila de sincronização
export interface SyncQueueItem {
  id: string;
  type: "research" | "data_collection";
  action: "create" | "update" | "delete";
  data: unknown;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para pesquisas
        if (!db.objectStoreNames.contains(RESEARCH_STORE)) {
          const researchStore = db.createObjectStore(RESEARCH_STORE, {
            keyPath: "id",
          });
          researchStore.createIndex("user_id", "user_id", { unique: false });
          researchStore.createIndex("status", "status", { unique: false });
        }

        // Store para dados coletados
        if (!db.objectStoreNames.contains(DATA_STORE)) {
          const dataStore = db.createObjectStore(DATA_STORE, {
            keyPath: "id",
          });
          dataStore.createIndex("research_id", "research_id", {
            unique: false,
          });
        }

        // Store para fila de sincronização
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id" });
        }
      };
    });
  }

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly"
  ): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Pesquisas
  async saveResearch(research: Research): Promise<void> {
    const store = await this.getStore(RESEARCH_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(research);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getResearch(id: string): Promise<Research | null> {
    const store = await this.getStore(RESEARCH_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllResearch(userId: string): Promise<Research[]> {
    const store = await this.getStore(RESEARCH_STORE);
    const index = store.index("user_id");
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteResearch(id: string): Promise<void> {
    const store = await this.getStore(RESEARCH_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Dados coletados
  async saveDataCollection(data: DataCollection): Promise<void> {
    const store = await this.getStore(DATA_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDataByResearch(researchId: string): Promise<DataCollection[]> {
    const store = await this.getStore(DATA_STORE);
    const index = store.index("research_id");
    return new Promise((resolve, reject) => {
      const request = index.getAll(researchId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedData(): Promise<DataCollection[]> {
    const store = await this.getStore(DATA_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allData = request.result || [];
        // Filtrar manualmente os dados não sincronizados
        const unsynced = allData.filter((item: DataCollection) => !item.is_synced);
        resolve(unsynced);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Fila de sincronização
  async addToSyncQueue(item: Omit<SyncQueueItem, "id">): Promise<void> {
    const store = await this.getStore(SYNC_QUEUE_STORE, "readwrite");
    const queueItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
    };
    return new Promise((resolve, reject) => {
      const request = store.put(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const store = await this.getStore(SYNC_QUEUE_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    const store = await this.getStore(SYNC_QUEUE_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    const store = await this.getStore(SYNC_QUEUE_STORE, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
