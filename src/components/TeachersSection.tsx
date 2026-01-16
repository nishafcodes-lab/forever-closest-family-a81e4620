import { GraduationCap } from "lucide-react";

const teachers = [
  { name: "Sir Kaleem", role: "HOD", emoji: "👔" },
  { name: "Mam Shadiha", role: "Strict but Caring", emoji: "📚" },
  { name: "Mam Nadia", role: "Mentor", emoji: "💫" },
  { name: "Mam Fatima Shah", role: "Guide", emoji: "🌟" },
  { name: "Mam Sidra", role: "Supporter", emoji: "✨" },
  { name: "Sir Hafiz Anwar Shahzada", role: "Legend of CS", emoji: "🏆" },
  { name: "Sir Abdul Rehman", role: "Supervisor", emoji: "🎯" },
  { name: "Sir Waqas", role: "Mentor", emoji: "💻" },
];

const TeachersSection = () => {
  return (
    <section id="teachers" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Our Mentors</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Teachers & Mentors
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The guiding lights who shaped our journey and made us who we are today
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <div
              key={teacher.name}
              className="group glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                {teacher.emoji}
              </div>
              <h3 className="font-display text-lg font-semibold text-center mb-1 group-hover:text-primary transition-colors">
                {teacher.name}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {teacher.role}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            "A teacher affects eternity; they can never tell where their influence stops."
          </p>
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
