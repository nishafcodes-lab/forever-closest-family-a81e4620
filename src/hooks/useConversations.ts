import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  type: string;
  name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    last_read_at: string | null;
  }[];
  last_message?: {
    content: string | null;
    message_type: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    // Get conversations the user is part of
    const { data: participantData } = await supabase
      .from("chat_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (!participantData || participantData.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationIds = participantData.map(p => p.conversation_id);
    const lastReadMap = new Map(participantData.map(p => [p.conversation_id, p.last_read_at]));

    // Get conversation details
    const { data: convData } = await supabase
      .from("chat_conversations")
      .select("*")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (!convData) {
      setLoading(false);
      return;
    }

    // Get all participants for these conversations
    const { data: allParticipants } = await supabase
      .from("chat_participants")
      .select("conversation_id, user_id, last_read_at")
      .in("conversation_id", conversationIds);

    // Get profiles for all participants
    const allUserIds = [...new Set(allParticipants?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", allUserIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Get last message for each conversation
    const conversationsWithDetails: Conversation[] = await Promise.all(
      convData.map(async (conv) => {
        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("content, message_type, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count unread messages
        const lastRead = lastReadMap.get(conv.id);
        let unreadCount = 0;
        if (lastRead) {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .gt("created_at", lastRead)
            .neq("sender_id", user.id);
          unreadCount = count || 0;
        }

        const participants = (allParticipants || [])
          .filter(p => p.conversation_id === conv.id)
          .map(p => {
            const profile = profileMap.get(p.user_id);
            return {
              user_id: p.user_id,
              display_name: profile?.display_name || "Unknown",
              avatar_url: profile?.avatar_url || null,
              last_read_at: p.last_read_at,
            };
          });

        return {
          ...conv,
          participants,
          last_message: lastMsg || undefined,
          unread_count: unreadCount,
        };
      })
    );

    setConversations(conversationsWithDetails);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => fetchConversations()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_participants" },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const createDirectConversation = async (otherUserId: string) => {
    if (!user) return null;

    // Check if direct conversation already exists
    const { data: existingParticipants } = await supabase
      .from("chat_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (existingParticipants) {
      for (const ep of existingParticipants) {
        const { data: otherParticipant } = await supabase
          .from("chat_participants")
          .select("conversation_id")
          .eq("conversation_id", ep.conversation_id)
          .eq("user_id", otherUserId)
          .maybeSingle();

        if (otherParticipant) {
          const { data: conv } = await supabase
            .from("chat_conversations")
            .select("*")
            .eq("id", ep.conversation_id)
            .eq("type", "direct")
            .maybeSingle();

          if (conv) return conv.id;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("chat_conversations")
      .insert({ type: "direct", created_by: user.id })
      .select()
      .single();

    if (convError || !newConv) return null;

    // Add participants
    await supabase
      .from("chat_participants")
      .insert([
        { conversation_id: newConv.id, user_id: user.id },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

    fetchConversations();
    return newConv.id;
  };

  const createGroupConversation = async (name: string, userIds: string[]) => {
    if (!user) return null;

    const { data: newConv, error } = await supabase
      .from("chat_conversations")
      .insert({ type: "group", name, created_by: user.id })
      .select()
      .single();

    if (error || !newConv) return null;

    const participants = [user.id, ...userIds].map(uid => ({
      conversation_id: newConv.id,
      user_id: uid,
    }));

    await supabase.from("chat_participants").insert(participants);

    fetchConversations();
    return newConv.id;
  };

  return {
    conversations,
    loading,
    fetchConversations,
    createDirectConversation,
    createGroupConversation,
  };
};
