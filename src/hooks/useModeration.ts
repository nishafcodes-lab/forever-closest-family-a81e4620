import { useCallback } from "react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

export const useModeration = () => {
  const moderateMessage = useCallback(async (message: string): Promise<boolean> => {
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "moderate", message }),
      });

      if (!resp.ok) {
        // Fail-open: if moderation service is down, allow the message
        return true;
      }

      const result = await resp.json();

      if (!result.allowed) {
        toast.error(result.reason || "This message was flagged as inappropriate and cannot be sent.", {
          duration: 5000,
        });
        return false;
      }

      return true;
    } catch (e) {
      console.error("Moderation error:", e);
      // Fail-open
      return true;
    }
  }, []);

  return { moderateMessage };
};
