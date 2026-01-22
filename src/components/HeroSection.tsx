import { Heart, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { memo } from "react";

const HeroSection = memo(() => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
      {/* Floating Particles - reduced for mobile performance */}
      <div className="hidden sm:block">
        <FloatingParticles count={30} />
      </div>
      <div className="sm:hidden">
        <FloatingParticles count={10} />
      </div>
      
      {/* Decorative Elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            y: [-10, 10, -10],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-52 sm:w-96 h-52 sm:h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ 
            y: [10, -10, 10],
            scale: [1.05, 1, 1.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-4 sm:mb-6 backdrop-blur-sm border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Class of 2021-2025</span>
          </motion.div>

          <motion.h1 
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="gradient-text">BSCS Reunion</span>
          </motion.h1>

          <motion.h2 
            className="font-display text-xl sm:text-2xl md:text-4xl text-foreground/80 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Batch 2021–2025
          </motion.h2>

          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 sm:mb-4 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Government Graduate College Khanpur
            <br />
            <span className="text-xs sm:text-sm">Affiliated with KFUEIT</span>
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-2 text-accent font-medium text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-center">"The Worst Class of the Whole College"</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              😎
            </motion.span>
          </motion.div>

          <motion.p 
            className="text-muted-foreground flex items-center justify-center gap-2 text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            But the Best in Memories 
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />
            </motion.div>
          </motion.p>

          <motion.div 
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.a
              href="#about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-lg text-sm sm:text-base"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Our Journey
            </motion.a>
            <motion.a
              href="#reunion"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary rounded-full font-medium backdrop-blur-sm text-sm sm:text-base"
              whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              whileTap={{ scale: 0.98 }}
            >
              Reunion Details
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        >
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;