import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/hooks/useChatMessages";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  showAvatar: boolean;
}

const ChatMessage = ({ message, isOwn, showAvatar }: ChatMessageProps) => {
  const renderContent = () => {
    switch (message.message_type) {
      case "image":
        return (
          <div className="max-w-[280px] sm:max-w-xs">
            <img
              src={message.media_url || ""}
              alt="Shared image"
              className="rounded-lg w-full object-contain cursor-pointer"
              onClick={() => window.open(message.media_url || "", "_blank")}
            />
            {message.content && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        );
      case "video":
        return (
          <div className="max-w-[280px] sm:max-w-xs">
            <video
              src={message.media_url || ""}
              controls
              className="rounded-lg w-full"
              preload="metadata"
            />
            {message.content && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex gap-2 mb-1 px-3 sm:px-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && showAvatar && (
        <Avatar className="h-7 w-7 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-7 flex-shrink-0" />}

      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        {!isOwn && showAvatar && (
          <p className="text-xs font-medium mb-0.5 opacity-70">{message.sender_name}</p>
        )}
        {renderContent()}
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] opacity-60">
            {format(new Date(message.created_at), "HH:mm")}
          </span>
          {isOwn && (
            <CheckCheck className="w-3 h-3 opacity-60" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
