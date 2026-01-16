import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface Message {
  id: string;
  author_name: string;
  author_email: string | null;
  message: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

const MessagesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("pending");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("messages")
      .update({ 
        status, 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id 
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Message ${status}` });
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message deleted successfully" });
      fetchMessages();
    }
  };

  const getFilteredMessages = (status: string) => {
    if (status === "all") return messages;
    return messages.filter(m => m.status === status);
  };

  const pendingCount = messages.filter(m => m.status === "pending").length;
  const approvedCount = messages.filter(m => m.status === "approved").length;
  const rejectedCount = messages.filter(m => m.status === "rejected").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Messages Management</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
          </TabsList>

          {["pending", "approved", "rejected", "all"].map((status) => (
            <TabsContent key={status} value={status}>
              {getFilteredMessages(status).length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No {status === "all" ? "" : status} messages yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredMessages(status).map((msg) => (
                    <div key={msg.id} className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{msg.author_name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              msg.status === "pending" ? "bg-orange-100 text-orange-800" :
                              msg.status === "approved" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {msg.status}
                            </span>
                          </div>
                          {msg.author_email && (
                            <p className="text-sm text-muted-foreground mb-2">{msg.author_email}</p>
                          )}
                          <p className="text-foreground mb-3">{msg.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {format(new Date(msg.created_at), "PPp")}
                            {msg.reviewed_at && ` • Reviewed: ${format(new Date(msg.reviewed_at), "PPp")}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {msg.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => updateStatus(msg.id, "approved")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => updateStatus(msg.id, "rejected")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default MessagesTab;
