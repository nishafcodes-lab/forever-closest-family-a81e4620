import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Loader2, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentGroup {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
}

interface Student {
  id: string;
  name: string;
}

interface GroupMember {
  group_id: string;
  student_id: string;
}

const GroupsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [groupsRes, studentsRes, membersRes] = await Promise.all([
      supabase.from("student_groups").select("*").order("name"),
      supabase.from("students").select("id, name").order("name"),
      supabase.from("group_members").select("group_id, student_id"),
    ]);
    
    if (groupsRes.data) setGroups(groupsRes.data);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (membersRes.data) setGroupMembers(membersRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", photo_url: "" });
    setEditingGroup(null);
    setSelectedMembers([]);
  };

  const openEdit = (group: StudentGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      photo_url: group.photo_url || "",
    });
    const members = groupMembers.filter(m => m.group_id === group.id).map(m => m.student_id);
    setSelectedMembers(members);
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `group-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("group-photos")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("group-photos").getPublicUrl(fileName);
    setFormData({ ...formData, photo_url: data.publicUrl });
    setUploading(false);
  };

  const toggleMember = (studentId: string) => {
    setSelectedMembers(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Group name is required", variant: "destructive" });
      return;
    }

    let groupId: string;

    if (editingGroup) {
      const { error } = await supabase
        .from("student_groups")
        .update({
          name: formData.name,
          description: formData.description || null,
          photo_url: formData.photo_url || null,
        })
        .eq("id", editingGroup.id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      groupId = editingGroup.id;

      // Delete existing members
      await supabase.from("group_members").delete().eq("group_id", groupId);
    } else {
      const { data, error } = await supabase.from("student_groups").insert({
        name: formData.name,
        description: formData.description || null,
        photo_url: formData.photo_url || null,
        created_by: user?.id,
      }).select().single();

      if (error || !data) {
        toast({ title: "Add failed", description: error?.message, variant: "destructive" });
        return;
      }
      groupId = data.id;
    }

    // Add members
    if (selectedMembers.length > 0) {
      const memberInserts = selectedMembers.map(studentId => ({
        group_id: groupId,
        student_id: studentId,
      }));
      await supabase.from("group_members").insert(memberInserts);
    }

    toast({ title: editingGroup ? "Group updated successfully" : "Group added successfully" });
    fetchData();
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    const { error } = await supabase.from("student_groups").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Group deleted successfully" });
      fetchData();
    }
  };

  const getGroupMembers = (groupId: string) => {
    const memberIds = groupMembers.filter(m => m.group_id === groupId).map(m => m.student_id);
    return students.filter(s => memberIds.includes(s.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Student Groups Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Group</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Group" : "Add New Group"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Group Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Group name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Group description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Photo</label>
                {formData.photo_url && (
                  <div className="relative w-20 h-20 mb-2">
                    <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button 
                      onClick={() => setFormData({ ...formData, photo_url: "" })}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Photo
                  </span>
                </label>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Members (Select Students)</label>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students added yet. Add students first.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-2">
                        <Checkbox
                          id={student.id}
                          checked={selectedMembers.includes(student.id)}
                          onCheckedChange={() => toggleMember(student.id)}
                        />
                        <label htmlFor={student.id} className="text-sm cursor-pointer">{student.name}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingGroup ? "Update Group" : "Add Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No groups added yet. Click "Add Group" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const members = getGroupMembers(group.id);
            return (
              <div key={group.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="h-40 bg-muted relative">
                  {group.photo_url ? (
                    <img src={group.photo_url} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                  )}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">{members.length} members</p>
                    {members.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {members.slice(0, 3).map(m => (
                          <span key={m.id} className="text-xs bg-muted px-2 py-0.5 rounded">{m.name}</span>
                        ))}
                        {members.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">+{members.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(group)}>
                      <Pencil className="w-3 h-3 mr-1" />Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(group.id)}>
                      <Trash2 className="w-3 h-3 mr-1 text-destructive" />Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsTab;
