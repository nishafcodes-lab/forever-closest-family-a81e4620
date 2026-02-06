import { Video, Play, Upload, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  uploader_name: string;
  created_at: string;
  view_count: number;
}

const VideosSection = memo(() => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const isFirstLoad = useRef(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, video_url, thumbnail_url, uploader_name, created_at, view_count")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(8);

    if (data && !error) {
      setVideos(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();

    const channel = supabase
      .channel("videos_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => {
          if (!isFirstLoad.current) {
            setIsUpdating(true);
            fetchVideos().then(() => {
              setIsUpdating(false);
              toast({
                title: "Videos Updated",
                description: "New videos are now available.",
              });
            });
          }
        }
      )
      .subscribe();

    const timer = setTimeout(() => {
      isFirstLoad.current = false;
    }, 1000);

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchVideos, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 100MB.",
        });
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to upload videos.",
      });
      return;
    }

    if (!formData.file || !formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a title and select a video file.",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, formData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const { error: insertError } = await supabase
        .from("videos")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          video_url: publicUrl,
          uploaded_by: user.id,
          uploader_name: profile?.display_name || user.email?.split("@")[0] || "Anonymous",
          status: "pending",
        });

      if (insertError) throw insertError;

      toast({
        title: "Video Uploaded!",
        description: "Your video will appear after admin approval.",
      });

      setFormData({ title: "", description: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setDialogOpen(false);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="videos" className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden">
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating videos...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/4 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/10 text-secondary mb-3 sm:mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Video className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Video Gallery</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            Reunion Videos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Watch and share videos from our memorable moments together
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <AnimatedSection className="text-center py-8 mb-8">
            <div className="glass-card rounded-xl sm:rounded-2xl p-8 max-w-md mx-auto">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm sm:text-base">No videos uploaded yet.</p>
              <p className="text-muted-foreground/70 text-xs mt-2">Be the first to share a memory!</p>
            </div>
          </AnimatedSection>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {videos.map((video) => (
              <StaggerItem key={video.id}>
                <motion.div
                  className="group glass-card rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
                  whileHover={{ y: -4, boxShadow: "var(--shadow-hover)" }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video bg-muted">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-contain bg-black/5"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={video.video_url}
                        className="w-full h-full object-contain bg-black"
                        preload="metadata"
                        muted
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.div
                        className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Play className="w-7 h-7 text-primary-foreground ml-1" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{video.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      by {video.uploader_name}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Upload CTA */}
        <AnimatedSection delay={0.2}>
          <motion.div
            className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-2xl mx-auto"
            whileHover={{ boxShadow: "var(--shadow-hover)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-secondary" />
            </motion.div>
            <h3 className="font-display text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Share Your Video
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
              Have a reunion video to share? Upload it and relive the memories!
            </p>

            {user ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full">
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-lg sm:text-xl">
                      Upload Your Video
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="video-title">Title *</Label>
                      <Input
                        id="video-title"
                        placeholder="Enter video title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        maxLength={100}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-desc">Description</Label>
                      <Textarea
                        id="video-desc"
                        placeholder="Add a description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        maxLength={500}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-file">Video File * (Max 100MB)</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Videos will be reviewed before appearing on the site.
                    </p>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full">
                    Login to Upload
                  </Button>
                </motion.div>
              </Link>
            )}
          </motion.div>
        </AnimatedSection>

        {/* Video Player Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden">
            {selectedVideo && (
              <div>
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] sm:max-h-[80vh]"
                />
                <div className="p-4 bg-card">
                  <h3 className="font-display text-lg font-semibold">{selectedVideo.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded by {selectedVideo.uploader_name}
                  </p>
                  {selectedVideo.description && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedVideo.description}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
});

VideosSection.displayName = "VideosSection";

export default VideosSection;