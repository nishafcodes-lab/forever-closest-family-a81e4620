import { GraduationCap } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonTeacherCard } from "@/components/ui/skeleton-card";

interface Teacher {
  id: string;
  name: string;
  role: string;
  designation: string | null;
  photo_url: string | null;
  description: string | null;
}

const defaultEmojis = ["👔", "📚", "💫", "🌟", "✨", "🏆", "🎯", "💻"];

const TeachersSection = memo(() => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: true });

    if (data && !error) {
      setTeachers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const getEmoji = (index: number) => defaultEmojis[index % defaultEmojis.length];

  return (
    <section id="teachers" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-primary/5 rounded-full blur-3xl translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/10 text-secondary mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Our Mentors</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Teachers & Mentors
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            The guiding lights who shaped our journey and made us who we are today
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonTeacherCard key={i} />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <AnimatedSection className="text-center text-muted-foreground">
            <p className="text-sm sm:text-base">No teachers added yet. Check back soon!</p>
          </AnimatedSection>
        ) : (
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {teachers.map((teacher, index) => (
              <StaggerItem key={teacher.id}>
                <motion.div
                  className="group glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow h-full"
                  whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
                  transition={{ duration: 0.3 }}
                >
                  {teacher.photo_url ? (
                    <motion.div 
                      className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden ring-2 sm:ring-4 ring-primary/10 bg-muted/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img
                        src={teacher.photo_url}
                        alt={teacher.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl sm:text-4xl ring-2 sm:ring-4 ring-primary/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {getEmoji(index)}
                    </motion.div>
                  )}
                  <h3 className="font-display text-sm sm:text-lg font-semibold text-center mb-0.5 sm:mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {teacher.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center line-clamp-1">
                    {teacher.role}
                  </p>
                  {teacher.designation && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center mt-0.5 sm:mt-1 line-clamp-1">
                      {teacher.designation}
                    </p>
                  )}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <AnimatedSection className="mt-8 sm:mt-12 text-center" delay={0.3}>
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground italic px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            "A teacher affects eternity; they can never tell where their influence stops."
          </motion.p>
        </AnimatedSection>
      </div>
    </section>
  );
});

TeachersSection.displayName = 'TeachersSection';

export default TeachersSection;