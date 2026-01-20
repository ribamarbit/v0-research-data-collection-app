"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncManager } from "@/lib/offline/sync";
import { offlineStorage } from "@/lib/offline/storage";
import { createClient } from "@/lib/supabase/client";

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    // Verificar status online
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Contar dados não sincronizados
    const checkUnsyncedData = async () => {
      try {
        await offlineStorage.init();
        const unsynced = await offlineStorage.getUnsyncedData();
        setUnsyncedCount(unsynced.length);
      } catch (error) {
        console.error("[v0] Erro ao verificar dados não sincronizados:", error);
        setUnsyncedCount(0);
      }
    };

    checkUnsyncedData();
    const interval = setInterval(checkUnsyncedData, 30000); // Atualizar a cada 30s

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Inicializar storage offline
      await offlineStorage.init();

      // Obter usuário atual
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fazer sincronização
        const result = await syncManager.syncAll();
        setSyncResult(result);

        // Atualizar contagem
        const unsynced = await offlineStorage.getUnsyncedData();
        setUnsyncedCount(unsynced.length);

        // Baixar dados do servidor
        await syncManager.downloadAllData(user.id);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        errors: [
          error instanceof Error ? error.message : "Erro ao sincronizar",
        ],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}

          {unsyncedCount > 0 && (
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {unsyncedCount} não sincronizado{unsyncedCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {syncResult && (
        <Alert
          variant={syncResult.success ? "default" : "destructive"}
          className={
            syncResult.success
              ? "border-green-200 bg-green-50"
              : undefined
          }
        >
          {syncResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription
            className={syncResult.success ? "text-green-800" : undefined}
          >
            {syncResult.success
              ? "Sincronização concluída com sucesso!"
              : `Erro na sincronização: ${syncResult.errors.join(", ")}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
