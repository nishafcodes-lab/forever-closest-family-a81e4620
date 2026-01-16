import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, Loader2, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GalleryItem {
  id: string;
  title: string | null;
  photo_url: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

const categories = ["Class Days", "Events", "Trips", "Farewell", "Other"];

const GalleryTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other" as string,
    photo_url: "",
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setGallery(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "Other", photo_url: "" });
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("gallery").getPublicUrl(fileName);
    setFormData({ ...formData, photo_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.photo_url) {
      toast({ title: "Please upload a photo", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("gallery").insert({
      title: formData.title || null,
      description: formData.description || null,
      category: formData.category,
      photo_url: formData.photo_url,
      uploaded_by: user?.id,
    });

    if (error) {
      toast({ title: "Add failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Photo added to gallery" });
      fetchGallery();
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Photo deleted successfully" });
      fetchGallery();
    }
  };

  const getByCategory = (category: string) => {
    if (category === "all") return gallery;
    return gallery.filter(g => g.category === category);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Gallery Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Photo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Photo *</label>
                {formData.photo_url ? (
                  <div className="relative w-full h-48 mb-2">
                    <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button 
                      onClick={() => setFormData({ ...formData, photo_url: "" })}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                    />
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload photo</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Photo title (optional)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Photo description (optional)"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!formData.photo_url || uploading}>
                Add to Gallery
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : gallery.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No photos in gallery yet. Click "Add Photo" to get started.</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({gallery.length})</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat} ({getByCategory(cat).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", ...categories].map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getByCategory(cat).map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={item.photo_url} 
                      alt={item.title || "Gallery photo"} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default GalleryTab;
