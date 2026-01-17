import { Heart, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudentGroup {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
}

interface GroupMember {
  group_id: string;
  student: {
    id: string;
    name: string;
  };
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

const GroupsSection = () => {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [members, setMembers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
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
  };

  const getEmoji = (index: number) => groupEmojis[index % groupEmojis.length];
  const getColor = (index: number) => groupColors[index % groupColors.length];

  if (loading) {
    return (
      <section id="groups" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="groups" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Friend Circles</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Student Groups
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            Same vibes, different groups <Heart className="w-4 h-4 text-accent fill-accent" />
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No groups created yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group, index) => {
              const groupMembers = members[group.id] || [];
              
              return (
                <div
                  key={group.id}
                  className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Photo or Placeholder */}
                  <div className={`h-48 relative overflow-hidden ${!group.photo_url ? `bg-gradient-to-br ${getColor(index)}` : ''}`}>
                    {group.photo_url ? (
                      <img
                        src={group.photo_url}
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {getEmoji(index)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                      {group.name} <span>{getEmoji(index)}</span>
                    </h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                    )}
                    {groupMembers.length > 0 ? (
                      <ul className="space-y-1.5">
                        {groupMembers.map((member) => (
                          <li key={member} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                            {member}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground/70 italic">No members yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupsSection;
