import { MessageCircle, Heart, Quote, Send, Loader2 } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonCard } from "@/components/ui/skeleton-card";
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

const MessagesSection = memo(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    message: "",
  });

  const fetchMessages = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
    <section id="messages" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">From The Heart</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Messages & Wishes
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Words from our hearts to yours
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <AnimatedSection className="text-center text-muted-foreground mb-8 sm:mb-12">
            <p className="text-sm sm:text-base">No messages yet. Be the first to share your thoughts!</p>
          </AnimatedSection>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
            {messages.map((msg) => (
              <StaggerItem key={msg.id}>
                <motion.div
                  className="group glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8 card-shadow relative h-full"
                  whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 10 }}
                  >
                    <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-primary/20" />
                  </motion.div>
                  <h4 className="font-display text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
                    {msg.author_name}
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic line-clamp-4">
                    "{msg.message}"
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Send Message CTA */}
        <AnimatedSection delay={0.2}>
          <motion.div 
            className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-2xl mx-auto"
            whileHover={{ boxShadow: "var(--shadow-hover)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-accent" />
            </motion.div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Share Your Message
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
              Have something special to say to your classmates or teachers? We'd love to hear from you!
            </p>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4" />
                    Send a Message
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md sm:max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-lg sm:text-xl">Share Your Message</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Input
                      placeholder="Your Name *"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      required
                      className="rounded-xl text-sm sm:text-base"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      type="email"
                      placeholder="Your Email (optional)"
                      value={formData.author_email}
                      onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                      className="rounded-xl text-sm sm:text-base"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Textarea
                      placeholder="Your message... *"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="rounded-xl text-sm sm:text-base"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button type="submit" className="w-full rounded-xl text-sm sm:text-base" disabled={submitting}>
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
                  </motion.div>
                  <p className="text-xs text-muted-foreground text-center">
                    Messages will be reviewed before appearing on the site.
                  </p>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
});

MessagesSection.displayName = 'MessagesSection';

export default MessagesSection;