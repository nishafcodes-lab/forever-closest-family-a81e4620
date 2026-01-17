import { Calendar, MapPin, Clock, Users, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Save The Date</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Reunion Event
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {reunionInfo?.description || "Let's meet again and relive the beautiful memories"}
          </p>
        </div>

        {/* Countdown Timer */}
        {reunionInfo?.countdown_enabled && reunionInfo?.reunion_date && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="grid grid-cols-4 gap-4">
              {countdownItems.map((item) => (
                <div
                  key={item.label}
                  className="glass-card rounded-2xl p-4 md:p-6 text-center card-shadow"
                >
                  <div className="font-display text-3xl md:text-5xl font-bold gradient-text mb-1">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Date</h3>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Time</h3>
            <p className="text-muted-foreground">{formattedTime} Onwards</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Venue</h3>
            <p className="text-muted-foreground">{reunionInfo?.venue || "TBA"}</p>
            {reunionInfo?.venue_address && (
              <p className="text-xs text-muted-foreground/70 mt-1">{reunionInfo.venue_address}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {(reunionInfo?.contact_email || reunionInfo?.contact_phone) && (
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {reunionInfo.contact_email && (
              <a href={`mailto:${reunionInfo.contact_email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                {reunionInfo.contact_email}
              </a>
            )}
            {reunionInfo.contact_phone && (
              <a href={`tel:${reunionInfo.contact_phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                {reunionInfo.contact_phone}
              </a>
            )}
          </div>
        )}

        {/* RSVP CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Users className="w-5 h-5" />
            Confirm Your Attendance
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReunionSection;
