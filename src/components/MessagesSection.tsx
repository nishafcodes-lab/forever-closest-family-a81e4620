import { MessageCircle, Heart, Quote, Send, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
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
  rating: number | null;
}

const MessagesSection = memo(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const isFirstLoad = useRef(true);
  const [formData, setFormData] = useState({
    author_name: "",
    message: "",
    rating: 5,
  });
  
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, author_name, message, created_at, rating")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setMessages(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          if (!isFirstLoad.current) {
            setIsUpdating(true);
            fetchMessages().then(() => {
              setIsUpdating(false);
              toast.success("New messages available!");
            });
          }
        }
      )
      .subscribe();

    // Mark first load as complete after initial fetch
    const timer = setTimeout(() => {
      isFirstLoad.current = false;
    }, 1000);

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    
    if (!formData.author_name.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name and message");
      return;
    }

    setSubmitting(true);
    
    // Get profile display name if available
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    
    const { error } = await supabase.from("messages").insert({
      author_name: profile?.display_name || formData.author_name.trim(),
      message: formData.message.trim(),
      rating: formData.rating,
      status: "pending",
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to submit review. Please try again.");
    } else {
      toast.success("Review submitted! It will appear after approval.");
      setFormData({ author_name: "", message: "", rating: 5 });
      setDialogOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <section id="messages" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Realtime update indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating messages...</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-h-[800px] overflow-y-auto pr-2">
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
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="font-display text-base sm:text-lg font-semibold text-primary">
                      {msg.author_name}
                    </h4>
                    {msg.rating && (
                      <StarRating rating={msg.rating} readonly size="sm" />
                    )}
                  </div>
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
              Share Your Review
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
              Rate your experience and share your thoughts about the reunion!
            </p>
            
            {user ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4" />
                    Write a Review
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md sm:max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-lg sm:text-xl">Write Your Review</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="review-name">Your Name *</Label>
                    <Input
                      id="review-name"
                      placeholder="Enter your name"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      required
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Your Rating *</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <StarRating 
                        rating={formData.rating} 
                        onChange={(rating) => setFormData({ ...formData, rating })}
                        size="lg"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.rating} / 5
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="review-message">Your Review *</Label>
                    <Textarea
                      id="review-message"
                      placeholder="Share your experience..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      maxLength={1000}
                      className="mt-1"
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
                        Submit Review
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Reviews will be reviewed before appearing on the site.
                  </p>
                </form>
              </DialogContent>
            </Dialog>
            ) : (
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full">
                    Login to Review
                  </Button>
                </motion.div>
              </Link>
            )}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
});

MessagesSection.displayName = 'MessagesSection';

export default MessagesSection;