import { Camera, Image } from "lucide-react";

const categories = [
  { name: "Class Days", icon: "📚", count: "Coming Soon" },
  { name: "Events", icon: "🎉", count: "Coming Soon" },
  { name: "Trips", icon: "🚌", count: "Coming Soon" },
  { name: "Farewell", icon: "🎓", count: "Coming Soon" },
];

const MemoriesSection = () => {
  return (
    <section id="memories" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Photo Gallery</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold gradient-text mb-4">
            Memories Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Captured moments that tell the story of our incredible journey together
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">{category.count}</p>
            </div>
          ))}
        </div>

        {/* Gallery Placeholder */}
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Image className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-3">
            Gallery Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're collecting precious memories from our batch. Share your photos to be featured here!
          </p>
        </div>
      </div>
    </section>
  );
};

export default MemoriesSection;
