import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Teacher {
  id: string;
  name: string;
  role: string;
  description: string | null;
  photo_url: string | null;
  designation: string | null;
}

const TeachersTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    designation: "Teacher" as string,
    photo_url: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("name");
    
    if (data) setTeachers(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", description: "", designation: "Teacher", photo_url: "" });
    setEditingTeacher(null);
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      role: teacher.role,
      description: teacher.description || "",
      designation: teacher.designation || "Teacher",
      photo_url: teacher.photo_url || "",
    });
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `teacher-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("teachers")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("teachers").getPublicUrl(fileName);
    setFormData({ ...formData, photo_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({ title: "Required fields missing", description: "Name and role are required", variant: "destructive" });
      return;
    }

    if (editingTeacher) {
      const { error } = await supabase
        .from("teachers")
        .update({
          name: formData.name,
          role: formData.role,
          description: formData.description || null,
          designation: formData.designation,
          photo_url: formData.photo_url || null,
        })
        .eq("id", editingTeacher.id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Teacher updated successfully" });
        fetchTeachers();
      }
    } else {
      const { error } = await supabase.from("teachers").insert({
        name: formData.name,
        role: formData.role,
        description: formData.description || null,
        designation: formData.designation,
        photo_url: formData.photo_url || null,
        created_by: user?.id,
      });

      if (error) {
        toast({ title: "Add failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Teacher added successfully" });
        fetchTeachers();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Teacher deleted successfully" });
      fetchTeachers();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Teachers Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Teacher</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Teacher name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Mentor, Supervisor"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <Select value={formData.designation} onValueChange={(v) => setFormData({ ...formData, designation: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Legend">Legend</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="HOD">HOD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description"
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
              <Button onClick={handleSubmit} className="w-full">
                {editingTeacher ? "Update Teacher" : "Add Teacher"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No teachers added yet. Click "Add Teacher" to get started.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    {teacher.photo_url ? (
                      <img src={teacher.photo_url} alt={teacher.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        👨‍🏫
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      teacher.designation === "Legend" ? "bg-yellow-100 text-yellow-800" :
                      teacher.designation === "HOD" ? "bg-purple-100 text-purple-800" :
                      teacher.designation === "Supervisor" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {teacher.designation}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(teacher)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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

export default TeachersTab;
