import { Heart, Users } from "lucide-react";
import { useState, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonGroupCard } from "@/components/ui/skeleton-card";

interface StudentGroup {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
}

const groupEmojis = ["💕", "🌸", "🌟", "✨", "💫", "🎯", "🔥", "💪"];
const groupColors = [
  "from-sky/20 to-primary/20",
  "from-accent/20 to-rose/20",
  "from-rose/20 to-primary/20",
  "from-gold/20 to-secondary/20",
  "from-secondary/20 to-sky/20",
  "from-primary/20 to-accent/20",
];

const GroupsSection = memo(() => {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    const { data: groupsData } = await supabase
      .from("student_groups")
      .select("*")
      .order("created_at", { ascending: true });

    if (groupsData) {
      setGroups(groupsData);

      // Fetch members for each group
      const { data: membersData } = await supabase
        .from("group_members")
        .select(`
          group_id,
          students (
            id,
            name
          )
        `);

      if (membersData) {
        const membersByGroup: Record<string, string[]> = {};
        membersData.forEach((m: any) => {
          if (!membersByGroup[m.group_id]) {
            membersByGroup[m.group_id] = [];
          }
          if (m.students) {
            membersByGroup[m.group_id].push(m.students.name);
          }
        });
        setMembers(membersByGroup);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const getEmoji = (index: number) => groupEmojis[index % groupEmojis.length];
  const getColor = (index: number) => groupColors[index % groupColors.length];

  return (
    <section id="groups" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Friend Circles</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Student Groups
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground flex items-center justify-center gap-2">
            Same vibes, different groups 
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-accent" />
            </motion.div>
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonGroupCard key={i} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <AnimatedSection className="text-center text-muted-foreground">
            <p className="text-sm sm:text-base">No groups created yet. Check back soon!</p>
          </AnimatedSection>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {groups.map((group, index) => {
              const groupMembers = members[group.id] || [];
              
              return (
                <StaggerItem key={group.id}>
                  <motion.div
                    className="group bg-card rounded-xl sm:rounded-2xl overflow-hidden card-shadow h-full"
                    whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Photo or Placeholder */}
                    <div className={`aspect-[4/3] relative overflow-hidden ${!group.photo_url ? `bg-gradient-to-br ${getColor(index)}` : ''}`}>
                      {group.photo_url ? (
                        <img
                          src={group.photo_url}
                          alt={group.name}
                          className="w-full h-full object-contain bg-muted/30 transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <motion.div 
                          className="w-full h-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-4xl sm:text-6xl">
                            {getEmoji(index)}
                          </span>
                        </motion.div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="font-display text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 flex items-center gap-2">
                        <span className="truncate">{group.name}</span> 
                        <span className="flex-shrink-0">{getEmoji(index)}</span>
                      </h3>
                      {group.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{group.description}</p>
                      )}
                      {groupMembers.length > 0 ? (
                        <ul className="space-y-1 sm:space-y-1.5 max-h-32 overflow-y-auto">
                          {groupMembers.slice(0, 5).map((member, mIndex) => (
                            <motion.li 
                              key={member} 
                              className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2"
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: mIndex * 0.05 }}
                            >
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                              <span className="truncate">{member}</span>
                            </motion.li>
                          ))}
                          {groupMembers.length > 5 && (
                            <li className="text-xs text-muted-foreground/70 italic">
                              +{groupMembers.length - 5} more members
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground/70 italic">No members yet</p>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
});

GroupsSection.displayName = 'GroupsSection';

export default GroupsSection;