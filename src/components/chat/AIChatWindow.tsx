import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Bot, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { useAIChat, AIMessage } from "@/hooks/useAIChat";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface AIChatWindowProps {
  onBack: () => void;
}

const AIChatWindow = ({ onBack }: AIChatWindowProps) => {
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

        <Avatar className="h-9 w-9 flex-shrink-0 bg-gradient-to-br from-primary to-accent">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            AI Assistant
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Typing..." : "Always here to help"}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={clearMessages}
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="py-4 px-3 sm:px-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                I can help you reconnect with classmates, draft messages to teachers, or answer questions about the reunion.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Help me write a message to my teacher",
                  "Suggest conversation starters",
                  "Tips for the reunion event",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card p-2 sm:p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            disabled={isLoading}
            className="min-h-[36px] max-h-32 resize-none text-sm py-2"
            rows={1}
          />
          <Button
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: AIMessage }) => {
  const isOwn = message.role === "user";

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <Avatar className="h-7 w-7 mt-1 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            <Bot className="w-3.5 h-3.5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        {isOwn ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <span className="text-[10px] opacity-60 block mt-0.5">
          {format(new Date(message.created_at), "HH:mm")}
        </span>
      </div>
    </div>
  );
};

export default AIChatWindow;
