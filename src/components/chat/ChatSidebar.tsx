import { useState, useEffect } from "react";
import { Search, Plus, Users, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Conversation } from "@/hooks/useConversations";
import { format, isToday, isYesterday } from "date-fns";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: (userId: string) => void;
  onNewGroup: (name: string, userIds: string[]) => void;
}

const ChatSidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onNewGroup,
}: ChatSidebarProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [presenceMap, setPresenceMap] = useState<Map<string, boolean>>(new Map());

  // Fetch presence data
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
      .channel("presence-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        () => fetchPresence()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getConversationName = (conv: Conversation) => {
    if (conv.type === "group") return conv.name || "Group Chat";
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other?.display_name || "Unknown";
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === "group") return null;
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other?.avatar_url || null;
  };

  const getOtherUserId = (conv: Conversation) => {
    if (conv.type === "group") return null;
    const other = conv.participants.find(p => p.user_id !== user?.id);
    return other?.user_id || null;
  };

  const isOnline = (conv: Conversation) => {
    const otherId = getOtherUserId(conv);
    if (!otherId) return false;
    return presenceMap.get(otherId) || false;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd/MM/yy");
  };

  const getLastMessagePreview = (conv: Conversation) => {
    if (!conv.last_message) return "No messages yet";
    if (conv.last_message.message_type === "image") return "📷 Photo";
    if (conv.last_message.message_type === "video") return "🎥 Video";
    return conv.last_message.content || "";
  };

  const filtered = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">Chats</h2>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setShowNewChat(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "No chats found" : "No conversations yet"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setShowNewChat(true)}
            >
              Start a chat
            </Button>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors border-b border-border/50 text-left ${
                activeConversation === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={getConversationAvatar(conv) || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {conv.type === "group" ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      getConversationName(conv).charAt(0).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                {conv.type === "direct" && isOnline(conv) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{getConversationName(conv)}</span>
                  {conv.last_message && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(conv.last_message.created_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate pr-2">
                    {getLastMessagePreview(conv)}
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </ScrollArea>

      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onSelectUser={onNewConversation}
        onCreateGroup={onNewGroup}
      />
    </div>
  );
};

export default ChatSidebar;
