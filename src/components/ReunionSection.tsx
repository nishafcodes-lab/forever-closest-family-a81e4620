import { Calendar, MapPin, Clock, Users, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { FloatingParticles } from "@/components/ui/floating-particles";

interface ReunionInfo {
  reunion_date: string | null;
  venue: string | null;
  venue_address: string | null;
  description: string | null;
  countdown_enabled: boolean | null;
  contact_email: string | null;
  contact_phone: string | null;
}

const ReunionSection = () => {
  const [reunionInfo, setReunionInfo] = useState<ReunionInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    fetchReunionInfo();

    // Subscribe to realtime updates
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
          // Refetch to get the latest data
          fetchReunionInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReunionInfo = async () => {
    const { data } = await supabase
      .from("reunion_info")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setReunionInfo(data);
    }
  };

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
    <section id="reunion" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-bg" />
      <FloatingParticles count={15} />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Save The Date</span>
          </motion.div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Reunion Event
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {reunionInfo?.description || "Let's meet again and relive the beautiful memories"}
          </p>
        </AnimatedSection>

        {/* Countdown Timer */}
        {reunionInfo?.countdown_enabled && reunionInfo?.reunion_date && (
          <AnimatedSection className="max-w-3xl mx-auto mb-16">
            <StaggerContainer className="grid grid-cols-4 gap-4">
              {countdownItems.map((item, index) => (
                <StaggerItem key={item.label}>
                  <motion.div
                    className="glass-card rounded-2xl p-4 md:p-6 text-center card-shadow"
                    whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
                  >
                    <motion.div 
                      className="font-display text-3xl md:text-5xl font-bold gradient-text mb-1"
                      key={item.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.value.toString().padStart(2, "0")}
                    </motion.div>
                    <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>
        )}

        {/* Event Details */}
        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <StaggerItem>
            <motion.div 
              className="glass-card rounded-2xl p-6 card-shadow text-center h-full"
              whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Calendar className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold mb-2">Date</h3>
              <p className="text-muted-foreground">{formattedDate}</p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div 
              className="glass-card rounded-2xl p-6 card-shadow text-center h-full"
              whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Clock className="w-6 h-6 text-secondary" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold mb-2">Time</h3>
              <p className="text-muted-foreground">{formattedTime} Onwards</p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div 
              className="glass-card rounded-2xl p-6 card-shadow text-center h-full"
              whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
            >
              <motion.div 
                className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <MapPin className="w-6 h-6 text-accent" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold mb-2">Venue</h3>
              <p className="text-muted-foreground">{reunionInfo?.venue || "TBA"}</p>
              {reunionInfo?.venue_address && (
                <p className="text-xs text-muted-foreground/70 mt-1">{reunionInfo.venue_address}</p>
              )}
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Contact Info */}
        {(reunionInfo?.contact_email || reunionInfo?.contact_phone) && (
          <AnimatedSection className="mt-8" delay={0.3}>
            <div className="flex flex-wrap justify-center gap-6">
              {reunionInfo.contact_email && (
                <motion.a 
                  href={`mailto:${reunionInfo.contact_email}`} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Mail className="w-4 h-4" />
                  {reunionInfo.contact_email}
                </motion.a>
              )}
              {reunionInfo.contact_phone && (
                <motion.a 
                  href={`tel:${reunionInfo.contact_phone}`} 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
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
        <AnimatedSection className="text-center mt-12" delay={0.4}>
          <motion.button 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5" />
            Confirm Your Attendance
          </motion.button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ReunionSection;
