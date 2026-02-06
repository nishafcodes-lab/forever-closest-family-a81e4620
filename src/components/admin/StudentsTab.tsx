import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Loader2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Student {
  id: string;
  name: string;
  batch: string;
  role: string | null;
  photo_url: string | null;
  bio: string | null;
  email: string | null;
}

const StudentsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    batch: "2021-2025",
    role: "Student" as string,
    bio: "",
    email: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name");
    
    if (data) setStudents(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: "", batch: "2021-2025", role: "Student", bio: "", email: "", photo_url: "" });
    setEditingStudent(null);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      batch: student.batch,
      role: student.role || "Student",
      bio: student.bio || "",
      email: student.email || "",
      photo_url: student.photo_url || "",
    });
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `student-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("students")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("students").getPublicUrl(fileName);
    setFormData({ ...formData, photo_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    if (editingStudent) {
      const { error } = await supabase
        .from("students")
        .update({
          name: formData.name,
          batch: formData.batch,
          role: formData.role,
          bio: formData.bio || null,
          email: formData.email || null,
          photo_url: formData.photo_url || null,
        })
        .eq("id", editingStudent.id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Student updated successfully" });
        fetchStudents();
      }
    } else {
      const { error } = await supabase.from("students").insert({
        name: formData.name,
        batch: formData.batch,
        role: formData.role,
        bio: formData.bio || null,
        email: formData.email || null,
        photo_url: formData.photo_url || null,
        created_by: user?.id,
      });

      if (error) {
        toast({ title: "Add failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Student added successfully" });
        fetchStudents();
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student deleted successfully" });
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Students Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Batch</label>
                <Input
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="e.g. 2021-2025"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="CRS">CRS (Class Representative)</SelectItem>
                    <SelectItem value="GRS">GRS (Group Representative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio"
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
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No students added yet. Click "Add Student" to get started.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        👨‍🎓
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.role === "CRS" ? "bg-blue-100 text-blue-800" :
                      student.role === "GRS" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {student.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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

export default StudentsTab;
