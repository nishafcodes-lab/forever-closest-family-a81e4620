import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePresence = () => {
  const { user } = useAuth();

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;
    
    const { data: existing } = await supabase
      .from("user_presence")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_presence")
        .update({ is_online: isOnline, last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_presence")
        .insert({ user_id: user.id, is_online: isOnline, last_seen: new Date().toISOString() });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    updatePresence(true);

    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline update
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
      const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Heartbeat every 30s
    const interval = setInterval(() => updatePresence(true), 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
      updatePresence(false);
    };
  }, [user, updatePresence]);
};
