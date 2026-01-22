import { Calendar, MapPin, Clock, Users, Phone, Mail, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { useToast } from "@/hooks/use-toast";

interface ReunionInfo {
  reunion_date: string | null;
  venue: string | null;
  venue_address: string | null;
  description: string | null;
  countdown_enabled: boolean | null;
  contact_email: string | null;
  contact_phone: string | null;
}

const ReunionSection = memo(() => {
  const { toast } = useToast();
  const [reunionInfo, setReunionInfo] = useState<ReunionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const isFirstLoad = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchReunionInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("reunion_info")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setReunionInfo(data);
      }
      setIsConnected(true);
    } catch (error) {
      console.error("Error fetching reunion info:", error);
      setIsConnected(false);
    } finally {
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchReunionInfo();

    // Subscribe to realtime updates with error handling
    const channel = supabase
      .channel("reunion_info_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reunion_info",
        },
        (payload) => {
          console.log("Reunion info updated:", payload);
          setIsUpdating(true);
          
          fetchReunionInfo().then(() => {
            if (!isFirstLoad.current) {
              toast({
                title: "🔄 Event Updated",
                description: "Reunion details have been refreshed",
              });
            }
            
            setTimeout(() => setIsUpdating(false), 1500);
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          // Retry connection after 5 seconds
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            fetchReunionInfo();
          }, 5000);
        }
      });

    // Fallback polling every 30 seconds if realtime fails
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchReunionInfo();
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [fetchReunionInfo, isConnected, toast]);

  useEffect(() => {
    if (!reunionInfo?.reunion_date || !reunionInfo?.countdown_enabled) return;

    const reunionDate = new Date(reunionInfo.reunion_date);
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = reunionDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reunionInfo]);

  const countdownItems = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  const formattedDate = reunionInfo?.reunion_date
    ? format(new Date(reunionInfo.reunion_date), "MMMM d, yyyy")
    : "TBA";

  const formattedTime = reunionInfo?.reunion_date
    ? format(new Date(reunionInfo.reunion_date), "h:mm a")
    : "TBA";

  return (
    <section id="reunion" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="hidden sm:block">
        <FloatingParticles count={15} />
      </div>
      <div className="sm:hidden">
        <FloatingParticles count={5} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Realtime update indicator */}
        <AnimatePresence>
          {isUpdating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="text-xs sm:text-sm font-medium">Updating...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection status indicator */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-destructive text-destructive-foreground shadow-lg"
            >
              <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Reconnecting...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 text-accent mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Save The Date</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Reunion Event
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {reunionInfo?.description || "Let's meet again and relive the beautiful memories"}
          </p>
        </AnimatedSection>

        {/* Countdown Timer */}
        {reunionInfo?.countdown_enabled && reunionInfo?.reunion_date && (
          <AnimatedSection className="max-w-3xl mx-auto mb-10 sm:mb-16">
            <StaggerContainer className="grid grid-cols-4 gap-2 sm:gap-4">
              {countdownItems.map((item) => (
                <StaggerItem key={item.label}>
                  <motion.div
                    className="glass-card rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 text-center card-shadow"
                    whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                  >
                    <motion.div 
                      className="font-display text-xl sm:text-3xl md:text-5xl font-bold gradient-text mb-0.5 sm:mb-1"
                      key={item.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.value.toString().padStart(2, "0")}
                    </motion.div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>
        )}

        {/* Event Details */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <StaggerItem>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow text-center h-full"
              whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </motion.div>
              <h3 className="font-display text-base sm:text-lg font-semibold mb-1 sm:mb-2">Date</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{formattedDate}</p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow text-center h-full"
              whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-secondary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </motion.div>
              <h3 className="font-display text-base sm:text-lg font-semibold mb-1 sm:mb-2">Time</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{formattedTime} Onwards</p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow text-center h-full"
              whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-accent/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </motion.div>
              <h3 className="font-display text-base sm:text-lg font-semibold mb-1 sm:mb-2">Venue</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{reunionInfo?.venue || "TBA"}</p>
              {reunionInfo?.venue_address && (
                <p className="text-xs text-muted-foreground/70 mt-1">{reunionInfo.venue_address}</p>
              )}
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Contact Info */}
        {(reunionInfo?.contact_email || reunionInfo?.contact_phone) && (
          <AnimatedSection className="mt-6 sm:mt-8" delay={0.3}>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6">
              {reunionInfo.contact_email && (
                <motion.a 
                  href={`mailto:${reunionInfo.contact_email}`} 
                  className="flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{reunionInfo.contact_email}</span>
                </motion.a>
              )}
              {reunionInfo.contact_phone && (
                <motion.a 
                  href={`tel:${reunionInfo.contact_phone}`} 
                  className="flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Phone className="w-4 h-4" />
                  {reunionInfo.contact_phone}
                </motion.a>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* RSVP CTA */}
        <AnimatedSection className="text-center mt-8 sm:mt-12" delay={0.4}>
          <motion.button 
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-lg text-sm sm:text-base"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Confirm Your Attendance
          </motion.button>
        </AnimatedSection>
      </div>
    </section>
  );
});

ReunionSection.displayName = 'ReunionSection';

export default ReunionSection;