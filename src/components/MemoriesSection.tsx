import { Camera, Image, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface GalleryPhoto {
  id: string;
  photo_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
}

const categories = [
  { name: "Class Days", icon: "📚" },
  { name: "Events", icon: "🎉" },
  { name: "Trips", icon: "🚌" },
  { name: "Farewell", icon: "🎓" },
  { name: "Other", icon: "📷" },
];

const MemoriesSection = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const getPhotoCount = (categoryName: string) => {
    return photos.filter((p) => p.category === categoryName).length;
  };

  const filteredPhotos = selectedCategory
    ? photos.filter((p) => p.category === selectedCategory)
    : photos;

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

        {/* Category Filter */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {categories.map((category) => {
            const count = getPhotoCount(category.name);
            const isSelected = selectedCategory === category.name;
            
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                className={`group glass-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 hover:-translate-y-2 cursor-pointer text-left ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "photo" : "photos"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="text-center text-muted-foreground">
            <p>Loading gallery...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Image className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-3">
              {selectedCategory ? `No ${selectedCategory} photos yet` : "Gallery Coming Soon"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're collecting precious memories from our batch. Share your photos to be featured here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer card-shadow hover:card-shadow-hover transition-all duration-500"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.title || "Gallery photo"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-medium truncate">{photo.title || "Untitled"}</p>
                    {photo.category && (
                      <p className="text-white/70 text-sm">{photo.category}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {selectedPhoto && (
              <div className="relative">
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.title || "Gallery photo"}
                  className="w-full max-h-[80vh] object-contain"
                />
                {(selectedPhoto.title || selectedPhoto.description) && (
                  <div className="p-4 bg-card">
                    {selectedPhoto.title && (
                      <h3 className="font-display text-lg font-semibold">{selectedPhoto.title}</h3>
                    )}
                    {selectedPhoto.description && (
                      <p className="text-muted-foreground mt-1">{selectedPhoto.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default MemoriesSection;
