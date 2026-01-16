import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

const ReunionSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set reunion date - adjust as needed
  const reunionDate = new Date("2025-12-15T18:00:00");

  useEffect(() => {
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
  }, []);

  const countdownItems = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

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
            Let's meet again and relive the beautiful memories
          </p>
        </div>

        {/* Countdown Timer */}
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

        {/* Event Details */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Date</h3>
            <p className="text-muted-foreground">December 15, 2025</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Time</h3>
            <p className="text-muted-foreground">6:00 PM Onwards</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Venue</h3>
            <p className="text-muted-foreground">GGC Khanpur Campus</p>
          </div>
        </div>

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
