"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePermission(resourceType: string, resourceId?: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) {
      setIsLoading(false);
      return;
    }

    checkPermission();
  }, [resourceId]);

  const checkPermission = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasPermission(false);
        return;
      }

      let permitted = false;

      if (resourceType === "research") {
        const { data, error } = await supabase
          .from("research")
          .select("id")
          .eq("id", resourceId)
          .eq("user_id", user.id)
          .single();

        permitted = !error && !!data;
      } else if (resourceType === "data_collection") {
        const { data, error } = await supabase
          .from("data_collection")
          .select("id")
          .eq("id", resourceId)
          .eq("user_id", user.id)
          .single();

        permitted = !error && !!data;
      }

      setHasPermission(permitted);
    } catch (error) {
      console.error("[v0] Erro ao verificar permissão:", error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasPermission, isLoading, recheckPermission: checkPermission };
}
