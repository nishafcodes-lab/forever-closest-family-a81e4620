import { Users, Star, Trophy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";

const leaders = [
  { role: "First GRs", names: ["Iqra Aslam", "Tahira Mustaq", "Fizz Asghar"], icon: Star },
  { role: "First CRs", names: ["Saqib", "Hamza"], icon: Trophy },
];

const AboutSection = memo(() => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            About Our Batch
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            The journey of BSCS 2021-2025 – filled with struggles, growth, and unforgettable friendships
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-16">
          <StaggerItem>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8 card-shadow h-full"
              whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold">Our Journey</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                From nervous freshers in 2021 to confident graduates in 2025, our batch has seen it all. 
                Late-night assignments, last-minute exam preparations, and countless cups of tea at the canteen.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We faced challenges together, celebrated victories as one, and created memories that will 
                last a lifetime. Through online classes during tough times and finally returning to campus, 
                we proved that nothing could break our spirit.
              </p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8 card-shadow h-full"
              whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </motion.div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold">The Bond</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                What made us "the worst class"? Perhaps it was our unity in chaos, our ability to turn 
                any situation into a memorable moment, or simply how we made our teachers both frustrated 
                and proud at the same time.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We weren't just classmates – we became family. Different backgrounds, different dreams, 
                but one unbreakable bond that defined our four years at GGC Khanpur.
              </p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Leadership Section */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {leaders.map((group, index) => (
            <StaggerItem key={group.role}>
              <motion.div
                className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8 card-shadow"
                whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 10 : -10 }}
                  >
                    <group.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </motion.div>
                  <h3 className="font-display text-xl sm:text-2xl font-semibold">{group.role}</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {group.names.map((name, nameIndex) => (
                    <motion.span
                      key={name}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: nameIndex * 0.1 }}
                      whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.2)" }}
                    >
                      {name}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;