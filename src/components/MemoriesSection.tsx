import { Camera, Image, X } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonPhoto } from "@/components/ui/skeleton-card";
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

const MemoriesSection = memo(() => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const fetchPhotos = useCallback(async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setPhotos(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const getPhotoCount = useCallback((categoryName: string) => {
    return photos.filter((p) => p.category === categoryName).length;
  }, [photos]);

  const filteredPhotos = selectedCategory
    ? photos.filter((p) => p.category === selectedCategory)
    : photos;

  return (
    <section id="memories" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 text-accent mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Photo Gallery</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Memories Gallery
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Captured moments that tell the story of our incredible journey together
          </p>
        </AnimatedSection>

        {/* Category Filter - Scrollable on mobile */}
        <div className="mb-8 sm:mb-12 -mx-4 px-4 sm:mx-0 sm:px-0">
          <StaggerContainer className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory">
            {categories.map((category) => {
              const count = getPhotoCount(category.name);
              const isSelected = selectedCategory === category.name;
              
              return (
                <StaggerItem key={category.name} className="snap-start">
                  <motion.button
                    onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                    className={`min-w-[140px] sm:min-w-0 w-full glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 card-shadow cursor-pointer text-left transition-all duration-300 ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="text-2xl sm:text-4xl mb-2 sm:mb-4"
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {category.icon}
                    </motion.div>
                    <h3 className="font-display text-sm sm:text-lg font-semibold mb-0.5 sm:mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {count} {count === 1 ? "photo" : "photos"}
                    </p>
                  </motion.button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonPhoto key={i} />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <AnimatedSection>
            <motion.div 
              className="glass-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Image className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </motion.div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
                {selectedCategory ? `No ${selectedCategory} photos yet` : "Gallery Coming Soon"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                We're collecting precious memories from our batch. Share your photos to be featured here!
              </p>
            </motion.div>
          </AnimatedSection>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square rounded-lg sm:rounded-xl overflow-hidden cursor-pointer card-shadow"
                  whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.title || "Gallery photo"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                      <p className="text-white font-medium text-xs sm:text-base truncate">{photo.title || "Untitled"}</p>
                      {photo.category && (
                        <p className="text-white/70 text-xs sm:text-sm">{photo.category}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Photo Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden">
            {selectedPhoto && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.title || "Gallery photo"}
                  className="w-full max-h-[70vh] sm:max-h-[80vh] object-contain"
                />
                {(selectedPhoto.title || selectedPhoto.description) && (
                  <div className="p-3 sm:p-4 bg-card">
                    {selectedPhoto.title && (
                      <h3 className="font-display text-base sm:text-lg font-semibold">{selectedPhoto.title}</h3>
                    )}
                    {selectedPhoto.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedPhoto.description}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
});

MemoriesSection.displayName = 'MemoriesSection';

export default MemoriesSection;