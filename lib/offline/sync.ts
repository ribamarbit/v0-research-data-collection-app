import { offlineStorage } from "./storage";
import { createClient } from "@/lib/supabase/client";
import type { Research, DataCollection } from "@/lib/types/database";

export class SyncManager {
  private syncInProgress = false;

  async syncAll(): Promise<{ success: boolean; errors: string[] }> {
    if (this.syncInProgress) {
      return { success: false, errors: ["Sincronização já em andamento"] };
    }

    if (!navigator.onLine) {
      return { success: false, errors: ["Sem conexão com a internet"] };
    }

    this.syncInProgress = true;
    const errors: string[] = [];

    try {
      const supabase = createClient();

      // Obter dados não sincronizados
      const unsyncedData = await offlineStorage.getUnsyncedData();

      // Sincronizar dados coletados
      for (const data of unsyncedData) {
        try {
          const { error } = await supabase
            .from("data_collection")
            .upsert({
              ...data,
              is_synced: true,
            });

          if (error) throw error;

          // Atualizar status local
          await offlineStorage.saveDataCollection({
            ...data,
            is_synced: true,
          });
        } catch (error) {
          errors.push(
            `Erro ao sincronizar dado ${data.id}: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      }

      // Processar fila de sincronização
      const syncQueue = await offlineStorage.getSyncQueue();

      for (const item of syncQueue) {
        try {
          if (item.type === "research") {
            if (item.action === "create" || item.action === "update") {
              const { error } = await supabase
                .from("research")
                .upsert(item.data as Research);
              if (error) throw error;
            } else if (item.action === "delete") {
              const { error } = await supabase
                .from("research")
                .delete()
                .eq("id", (item.data as Research).id);
              if (error) throw error;
            }
          } else if (item.type === "data_collection") {
            if (item.action === "create" || item.action === "update") {
              const { error } = await supabase
                .from("data_collection")
                .upsert(item.data as DataCollection);
              if (error) throw error;
            } else if (item.action === "delete") {
              const { error } = await supabase
                .from("data_collection")
                .delete()
                .eq("id", (item.data as DataCollection).id);
              if (error) throw error;
            }
          }

          // Remover da fila após sincronização bem-sucedida
          await offlineStorage.removeSyncQueueItem(item.id);
        } catch (error) {
          errors.push(
            `Erro ao sincronizar item ${item.id}: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`
          );
        }
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      errors.push(
        `Erro geral de sincronização: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
      return { success: false, errors };
    } finally {
      this.syncInProgress = false;
    }
  }

  async downloadAllData(userId: string): Promise<void> {
    const supabase = createClient();

    // Baixar pesquisas
    const { data: research, error: researchError } = await supabase
      .from("research")
      .select("*")
      .eq("user_id", userId);

    if (!researchError && research) {
      for (const item of research) {
        await offlineStorage.saveResearch(item);
      }
    }

    // Baixar dados coletados
    const { data: dataCollection, error: dataError } = await supabase
      .from("data_collection")
      .select("*")
      .eq("user_id", userId);

    if (!dataError && dataCollection) {
      for (const item of dataCollection) {
        await offlineStorage.saveDataCollection(item);
      }
    }
  }
}

export const syncManager = new SyncManager();
