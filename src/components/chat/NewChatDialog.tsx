import { useState, useEffect } from "react";
import { Search, Users, User, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
  onCreateGroup: (name: string, userIds: string[]) => void;
}

const NewChatDialog = ({ open, onOpenChange, onSelectUser, onCreateGroup }: NewChatDialogProps) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    const fetchProfiles = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .neq("user_id", user?.id || "");
      
      if (data) setProfiles(data);
      setLoading(false);
    };

    fetchProfiles();
  }, [open, user]);

  const filtered = profiles.filter(p =>
    p.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectForDirect = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
    setSearch("");
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName.trim(), selectedUsers);
      onOpenChange(false);
      setGroupName("");
      setSelectedUsers([]);
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New Chat</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1 gap-2">
              <User className="w-4 h-4" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1 gap-2">
              <Users className="w-4 h-4" />
              Group
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <TabsContent value="direct" className="mt-3">
            <ScrollArea className="h-64">
              {filtered.map(profile => (
                <button
                  key={profile.user_id}
                  onClick={() => handleSelectForDirect(profile.user_id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{profile.display_name}</span>
                </button>
              ))}
              {filtered.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="mt-3 space-y-3">
            <Input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <ScrollArea className="h-52">
              {filtered.map(profile => (
                <button
                  key={profile.user_id}
                  onClick={() => toggleUserSelection(profile.user_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedUsers.includes(profile.user_id) ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1 text-left">{profile.display_name}</span>
                  {selectedUsers.includes(profile.user_id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </ScrollArea>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="w-full"
            >
              Create Group ({selectedUsers.length} members)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
