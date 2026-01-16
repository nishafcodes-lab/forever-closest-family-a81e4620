import { Heart, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-20">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Class of 2021-2025</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">BSCS Reunion</span>
          </h1>

          <h2 className="font-display text-2xl md:text-4xl text-foreground/80 mb-4">
            Batch 2021–2025
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Government Graduate College Khanpur
            <br />
            <span className="text-sm">Affiliated with KFUEIT</span>
          </p>

          <div className="flex items-center justify-center gap-2 text-accent font-medium text-lg md:text-xl mb-8">
            <span>"The Worst Class of the Whole College"</span>
            <span>😎</span>
          </div>

          <p className="text-muted-foreground flex items-center justify-center gap-2 text-lg">
            But the Best in Memories <Heart className="w-5 h-5 text-accent fill-accent animate-pulse-soft" />
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Our Journey
            </a>
            <a
              href="#reunion"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Reunion Details
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
