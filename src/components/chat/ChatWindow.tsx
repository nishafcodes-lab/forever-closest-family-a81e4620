import { useEffect, useRef } from "react";
import { ArrowLeft, MoreVertical, Phone, Video, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatMessages } from "@/hooks/useChatMessages";
import { Conversation } from "@/hooks/useConversations";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack: () => void;
  isOnline?: boolean;
}

const ChatWindow = ({ conversation, onBack, isOnline }: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, uploadMedia } = useChatMessages(
    conversation?.id || null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Welcome to Chat
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Select a conversation or start a new chat to begin messaging
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
  const displayName = conversation.type === "group"
    ? conversation.name || "Group Chat"
    : otherParticipant?.display_name || "Unknown";
  const avatarUrl = conversation.type === "group" ? null : otherParticipant?.avatar_url;

  const handleSend = async (content: string, type?: string, mediaUrl?: string) => {
    await sendMessage(content, type, mediaUrl);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden flex-shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {conversation.type === "group" ? (
              <Users className="w-4 h-4" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation.type === "group"
              ? `${conversation.participants.length} members`
              : isOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello! 👋
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                  showAvatar={showAvatar}
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSend}
        onUploadMedia={uploadMedia}
      />
    </div>
  );
};

export default ChatWindow;
