import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { usePresence } from "@/hooks/usePresence";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(!isMobile);
  const [presenceMap, setPresenceMap] = useState<Map<string, boolean>>(new Map());

  const {
    conversations,
    loading: convsLoading,
    createDirectConversation,
    createGroupConversation,
  } = useConversations();

  // Initialize presence tracking
  usePresence();

  // Fetch presence
  useEffect(() => {
    const fetchPresence = async () => {
      const { data } = await supabase
        .from("user_presence")
        .select("user_id, is_online");
      if (data) {
        setPresenceMap(new Map(data.map(p => [p.user_id, p.is_online])));
      }
    };

    fetchPresence();

    const channel = supabase
      .channel("chat-presence")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        () => fetchPresence()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isMobile) setShowChat(true);
  };

  const handleNewConversation = async (userId: string) => {
    const convId = await createDirectConversation(userId);
    if (convId) {
      setActiveConversationId(convId);
      if (isMobile) setShowChat(true);
    }
  };

  const handleNewGroup = async (name: string, userIds: string[]) => {
    const convId = await createGroupConversation(name, userIds);
    if (convId) {
      setActiveConversationId(convId);
      if (isMobile) setShowChat(true);
    }
  };

  const handleBack = () => {
    if (isMobile) setShowChat(false);
  };

  const isOtherOnline = (conv: typeof activeConversation) => {
    if (!conv || conv.type === "group") return false;
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other ? presenceMap.get(other.user_id) || false : false;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? showChat
              ? "hidden"
              : "w-full"
            : "w-80 xl:w-96 flex-shrink-0"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onNewGroup={handleNewGroup}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          isMobile
            ? showChat
              ? "w-full"
              : "hidden"
            : "flex-1"
        }`}
      >
        <ChatWindow
          conversation={activeConversation}
          onBack={handleBack}
          isOnline={isOtherOnline(activeConversation)}
        />
      </div>
    </div>
  );
};

export default Chat;
