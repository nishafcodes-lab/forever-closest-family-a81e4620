import { MessageCircle, Heart, Quote, Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

const MessagesSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    message: "",
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, author_name, message, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && !error) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author_name.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name and message");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("messages").insert({
      author_name: formData.author_name.trim(),
      author_email: formData.author_email.trim() || null,
      message: formData.message.trim(),
      status: "pending",
    });

    if (error) {
      toast.error("Failed to submit message. Please try again.");
    } else {
      toast.success("Message submitted! It will appear after approval.");
      setFormData({ author_name: "", author_email: "", message: "" });
      setDialogOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <section id="messages" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">From The Heart</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Messages & Wishes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Words from our hearts to yours
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground mb-12">
            <p>No messages yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="group glass-card rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-500 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                <h4 className="font-display text-lg font-semibold text-primary mb-4">
                  {msg.author_name}
                </h4>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{msg.message}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Send Message CTA */}
        <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
          <Heart className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="font-display text-2xl font-semibold mb-3">
            Share Your Message
          </h3>
          <p className="text-muted-foreground mb-6">
            Have something special to say to your classmates or teachers? We'd love to hear from you!
          </p>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2 px-6 py-3 rounded-full">
                <MessageCircle className="w-4 h-4" />
                Send a Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Input
                    placeholder="Your Name *"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email (optional)"
                    value={formData.author_email}
                    onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your message... *"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Message
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Messages will be reviewed before appearing on the site.
                </p>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default MessagesSection;
