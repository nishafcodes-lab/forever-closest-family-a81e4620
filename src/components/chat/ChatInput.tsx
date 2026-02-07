import { useState, useRef } from "react";
import { Send, Image, Video, Paperclip, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (content: string, type?: string, mediaUrl?: string) => void;
  onUploadMedia: (file: File) => Promise<string | null>;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, onUploadMedia, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string; file: File } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (preview) {
      setUploading(true);
      const mediaUrl = await onUploadMedia(preview.file);
      if (mediaUrl) {
        onSendMessage(message, preview.type, mediaUrl);
      }
      setUploading(false);
      setPreview(null);
      setMessage("");
      return;
    }

    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) return;

    const url = URL.createObjectURL(file);
    setPreview({ url, type: isImage ? "image" : "video", file });
    
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="border-t border-border bg-card p-2 sm:p-3">
      {/* Media Preview */}
      {preview && (
        <div className="mb-2 relative inline-block">
          {preview.type === "image" ? (
            <img src={preview.url} alt="Preview" className="h-20 rounded-lg object-cover" />
          ) : (
            <video src={preview.url} className="h-20 rounded-lg" />
          )}
          <button
            onClick={() => { setPreview(null); URL.revokeObjectURL(preview.url); }}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || uploading}
          className="min-h-[36px] max-h-32 resize-none text-sm py-2"
          rows={1}
        />

        <Button
          size="icon"
          className="h-9 w-9 flex-shrink-0 rounded-full"
          onClick={handleSend}
          disabled={disabled || uploading || (!message.trim() && !preview)}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
