import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Trash2, Video, Loader2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  uploader_name: string;
  status: string;
  created_at: string;
}

const VideosTab = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchVideos = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setVideos(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    const { error } = await supabase
      .from("videos")
      .update({ 
        status, 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id 
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update video status");
    } else {
      toast.success(`Video ${status === "approved" ? "approved" : "rejected"}`);
      fetchVideos();
    }
    setActionLoading(null);
  };

  const deleteVideo = async (id: string, videoUrl: string) => {
    setActionLoading(id);
    
    // Extract file path from URL for storage deletion
    try {
      const urlParts = videoUrl.split("/videos/");
      if (urlParts[1]) {
        await supabase.storage.from("videos").remove([urlParts[1]]);
      }
    } catch {
      console.error("Error deleting video file");
    }

    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete video");
    } else {
      toast.success("Video deleted successfully");
      fetchVideos();
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Management
        </h2>
        <Badge variant="outline">{videos.length} total</Badge>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No videos uploaded yet.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {video.title}
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {video.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                        {video.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{video.uploader_name}</TableCell>
                  <TableCell>{getStatusBadge(video.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(video.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {video.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => updateStatus(video.id, "approved")}
                            disabled={actionLoading === video.id}
                          >
                            {actionLoading === video.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(video.id, "rejected")}
                            disabled={actionLoading === video.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === video.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{video.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVideo(video.id, video.video_url)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VideosTab;