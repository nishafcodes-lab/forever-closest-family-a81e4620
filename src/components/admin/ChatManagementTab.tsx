import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Download, MessageCircle, Trash2, Filter,
  Loader2, Users, User, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface ConversationData {
  id: string;
  type: string;
  name: string | null;
  created_at: string;
  participants: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  }[];
  message_count: number;
  last_message_at: string | null;
}

interface MessageData {
  id: string;
  content: string | null;
  message_type: string;
  media_url: string | null;
  created_at: string;
  sender_name: string;
}

const ChatManagementTab = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [profiles, setProfiles] = useState<Map<string, { display_name: string; avatar_url: string | null }>>(new Map());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch all profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url");
    
    const profileMap = new Map(
      profileData?.map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }]) || []
    );
    setProfiles(profileMap);

    // Fetch all conversations
    const { data: convData } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!convData) {
      setLoading(false);
      return;
    }

    // Fetch all participants
    const convIds = convData.map(c => c.id);
    const { data: participantData } = await supabase
      .from("chat_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    // Fetch message counts
    const conversationsWithDetails: ConversationData[] = await Promise.all(
      convData.map(async (conv) => {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id);

        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const participants = (participantData || [])
          .filter(p => p.conversation_id === conv.id)
          .map(p => ({
            user_id: p.user_id,
            display_name: profileMap.get(p.user_id)?.display_name || "Unknown",
            avatar_url: profileMap.get(p.user_id)?.avatar_url || null,
          }));

        return {
          ...conv,
          participants,
          message_count: count || 0,
          last_message_at: lastMsg?.created_at || null,
        };
      })
    );

    setConversations(conversationsWithDetails);
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    setMessagesLoading(true);
    setSelectedConv(convId);

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      const messagesWithNames = data.map(msg => ({
        ...msg,
        sender_name: profiles.get(msg.sender_id)?.display_name || "Unknown",
      }));
      setMessages(messagesWithNames);
    }

    setMessagesLoading(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("Delete this conversation and all its messages?")) return;

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", convId);

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conversation deleted" });
      if (selectedConv === convId) {
        setSelectedConv(null);
        setMessages([]);
      }
      fetchData();
    }
  };

  const downloadChatCSV = () => {
    if (messages.length === 0) return;

    const headers = ["Date", "Time", "Sender", "Type", "Message", "Media URL"];
    const rows = messages.map(m => [
      format(new Date(m.created_at), "yyyy-MM-dd"),
      format(new Date(m.created_at), "HH:mm:ss"),
      m.sender_name,
      m.message_type,
      m.content || "",
      m.media_url || "",
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadStudentList = () => {
    const allUsers = new Map<string, string>();
    conversations.forEach(conv => {
      conv.participants.forEach(p => {
        allUsers.set(p.user_id, p.display_name);
      });
    });

    const headers = ["User ID", "Display Name"];
    const rows = [...allUsers.entries()].map(([id, name]) => [id, name]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-list-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p =>
      p.display_name.toLowerCase().includes(search.toLowerCase())
    ) || (conv.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" || conv.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-2xl font-bold">Chat Management</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={downloadStudentList} className="gap-2">
            <Users className="w-4 h-4" />
            Export Students
          </Button>
          {selectedConv && messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={downloadChatCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export Chat
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chats</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="group">Groups</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversations List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-sm">
                Conversations ({filtered.length})
              </h3>
            </div>
            <ScrollArea className="h-[500px]">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations found</p>
                </div>
              ) : (
                filtered.map(conv => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors ${
                      selectedConv === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => fetchMessages(conv.id)}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.type === "group" ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {conv.type === "group"
                            ? conv.name || "Group"
                            : conv.participants.map(p => p.display_name).join(", ")}
                        </span>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {conv.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{conv.message_count} messages</span>
                        {conv.last_message_at && (
                          <span>• {format(new Date(conv.last_message_at), "PPp")}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Messages View */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {selectedConv ? `Messages (${messages.length})` : "Select a conversation"}
              </h3>
            </div>
            <ScrollArea className="h-[500px]">
              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {selectedConv ? "No messages in this conversation" : "Click a conversation to view messages"}
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-primary">{msg.sender_name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.created_at), "PPp")}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{msg.message_type}</Badge>
                      </div>
                      {msg.message_type === "text" && (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      {msg.message_type === "image" && msg.media_url && (
                        <img src={msg.media_url} alt="" className="h-20 rounded object-cover" />
                      )}
                      {msg.message_type === "video" && msg.media_url && (
                        <video src={msg.media_url} controls className="h-20 rounded" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatManagementTab;
