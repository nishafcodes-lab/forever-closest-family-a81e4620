import { Users, Star, Trophy, Heart } from "lucide-react";

const leaders = [
  { role: "First GRs", names: ["Iqra Aslam", "Tahira Mustaq", "Fizz Asghar"], icon: Star },
  { role: "First CRs", names: ["Saqib", "Hamza"], icon: Trophy },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            About Our Batch
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The journey of BSCS 2021-2025 – filled with struggles, growth, and unforgettable friendships
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Our Journey</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              From nervous freshers in 2021 to confident graduates in 2025, our batch has seen it all. 
              Late-night assignments, last-minute exam preparations, and countless cups of tea at the canteen.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We faced challenges together, celebrated victories as one, and created memories that will 
              last a lifetime. Through online classes during tough times and finally returning to campus, 
              we proved that nothing could break our spirit.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-2xl font-semibold">The Bond</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              What made us "the worst class"? Perhaps it was our unity in chaos, our ability to turn 
              any situation into a memorable moment, or simply how we made our teachers both frustrated 
              and proud at the same time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We weren't just classmates – we became family. Different backgrounds, different dreams, 
              but one unbreakable bond that defined our four years at GGC Khanpur.
            </p>
          </div>
        </div>

        {/* Leadership Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {leaders.map((group) => (
            <div
              key={group.role}
              className="glass-card rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <group.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{group.role}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {group.names.map((name) => (
                  <span
                    key={name}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
