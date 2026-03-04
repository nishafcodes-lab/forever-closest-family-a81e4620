import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, Mail, GraduationCap, ArrowLeft, X, Calendar, User, Image, ImageOff, Grid3X3, List, Briefcase, MapPin, Building2, Edit2, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  batch: string;
  role: string | null;
  photo_url: string | null;
  bio: string | null;
  email: string | null;
  roll_number: string | null;
  created_at?: string;
}

interface StudentStatus {
  id: string;
  student_id: string;
  user_id: string | null;
  status_type: string;
  company: string | null;
  job_title: string | null;
  location: string | null;
  updated_at: string;
}

const STATUS_OPTIONS = ["Employed", "Studying", "Freelancing", "Internship", "Business", "Job Seeking", "Not Updated"];

const StudentDirectory = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, StudentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Status editing state
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState({ status_type: "", company: "", job_title: "", location: "" });
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchStatuses();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("roll_number", { ascending: true, nullsFirst: false });
    if (data) setStudents(data);
    setLoading(false);
  };

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from("student_status")
      .select("*");
    if (data) {
      const map: Record<string, StudentStatus> = {};
      data.forEach((s: any) => { map[s.student_id] = s; });
      setStatuses(map);
    }
  };

  const batches = useMemo(() => {
    return [...new Set(students.map((s) => s.batch))].sort();
  }, [students]);

  const roles = useMemo(() => {
    return [...new Set(students.map((s) => s.role).filter(Boolean))] as string[];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch;
      const matchesRole = selectedRole === "all" || student.role === selectedRole;
      const matchesPhoto =
        photoFilter === "all" ||
        (photoFilter === "has-photo" && !!student.photo_url) ||
        (photoFilter === "no-photo" && !student.photo_url);
      const matchesStatus =
        statusFilter === "all" ||
        (statuses[student.id]?.status_type || "Not Updated") === statusFilter;
      return matchesSearch && matchesBatch && matchesRole && matchesPhoto && matchesStatus;
    });
  }, [students, searchTerm, selectedBatch, selectedRole, photoFilter, statusFilter, statuses]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedRole("all");
    setPhotoFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || selectedBatch !== "all" || selectedRole !== "all" || photoFilter !== "all" || statusFilter !== "all";

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "CRS": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "GRS": return "bg-green-500 hover:bg-green-600 text-white";
      default: return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  const getRoleFullName = (role: string | null) => {
    switch (role) {
      case "CRS": return "Class Representative";
      case "GRS": return "Group Representative";
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Employed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Studying": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Freelancing": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Internship": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Business": return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "Job Seeking": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    const status = statuses[student.id];
    setStatusForm({
      status_type: status?.status_type || "Not Updated",
      company: status?.company || "",
      job_title: status?.job_title || "",
      location: status?.location || "",
    });
    setEditingStatus(false);
  };

  const canEditStatus = (student: Student) => {
    if (!user) return false;
    if (isAdmin) return true;
    // Check if this student's email matches the logged-in user's email
    return !!student.email && student.email === user.email;
  };

  const handleSaveStatus = async (student: Student) => {
    if (!user) return;
    setSavingStatus(true);

    const existing = statuses[student.id];
    const payload = {
      student_id: student.id,
      user_id: existing?.user_id || user.id,
      status_type: statusForm.status_type,
      company: statusForm.company || null,
      job_title: statusForm.job_title || null,
      location: statusForm.location || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (existing) {
      const res = await supabase.from("student_status").update(payload).eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase.from("student_status").insert(payload);
      error = res.error;
    }

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated successfully!");
      setEditingStatus(false);
      await fetchStatuses();
    }
    setSavingStatus(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Student Directory</h1>
                <p className="text-sm text-muted-foreground">
                  Browse all {students.length} batch members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{filteredStudents.length}</span>
                <span className="text-muted-foreground">shown</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <AnimatedSection className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, roll number, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>

              <div className="w-full lg:w-48">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Batches" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-48">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Roles" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Filter */}
              <div className="w-full lg:w-48">
                <Select value={photoFilter} onValueChange={setPhotoFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Photos" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Photos</SelectItem>
                    <SelectItem value="has-photo">Has Photo</SelectItem>
                    <SelectItem value="no-photo">No Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="h-12">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchTerm}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {selectedBatch !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Batch: {selectedBatch}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBatch("all")} />
                  </Badge>
                )}
                {selectedRole !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Role: {selectedRole}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRole("all")} />
                  </Badge>
                )}
                {photoFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {photoFilter === "has-photo" ? <Image className="w-3 h-3" /> : <ImageOff className="w-3 h-3" />}
                    {photoFilter === "has-photo" ? "Has Photo" : "No Photo"}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setPhotoFilter("all")} />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4" />
                <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters ? "Try adjusting your search or filters" : "No students have been added yet"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student, index) => {
              const status = statuses[student.id];
              const statusType = status?.status_type || "Not Updated";
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group cursor-pointer"
                  onClick={() => openStudentModal(student)}
                >
                  <div className="bg-card rounded-2xl border border-border p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="w-full h-full rounded-full object-cover border-4 border-background shadow-md" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-4xl border-4 border-background shadow-md">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {student.role && student.role !== "Student" && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <Badge className={`text-xs ${getRoleBadgeColor(student.role)}`}>{student.role}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                        {student.name}
                      </h3>
                      {student.roll_number && (
                        <p className="text-xs font-mono text-muted-foreground mb-1">Roll # {student.roll_number}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {student.batch}
                      </p>

                      {/* Status Badge */}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(statusType)}`}>
                        <Briefcase className="w-3 h-3 mr-1" />
                        {statusType}
                      </Badge>

                      {status?.company && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {status.company}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredStudents.map((student, index) => {
              const status = statuses[student.id];
              const statusType = status?.status_type || "Not Updated";
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => openStudentModal(student)}
                >
                  <div className="w-14 h-14 flex-shrink-0">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} className="w-full h-full rounded-full object-cover border-2 border-background shadow-sm" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xl border-2 border-background">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      {student.role && student.role !== "Student" && (
                        <Badge className={`text-xs ${getRoleBadgeColor(student.role)}`}>{student.role}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      {student.roll_number && <span className="font-mono">#{student.roll_number}</span>}
                      <span>{student.batch}</span>
                      {status?.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {status.company}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs flex-shrink-0 ${getStatusColor(statusType)}`}>
                    {statusType}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredStudents.length > 0 && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </main>

      {/* Student Profile Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedStudent && (
              <motion.div
                key={selectedStudent.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className="sr-only">
                  <DialogTitle>{selectedStudent.name}'s Profile</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center pt-4">
                  <div className="relative w-32 h-32 mb-6">
                    {selectedStudent.photo_url ? (
                      <img src={selectedStudent.photo_url} alt={selectedStudent.name} className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-xl" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-5xl border-4 border-primary/20 shadow-xl">
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-1">{selectedStudent.name}</h2>
                  {selectedStudent.roll_number && (
                    <p className="text-sm font-mono text-muted-foreground mb-2">Roll # {selectedStudent.roll_number}</p>
                  )}
                  {selectedStudent.role && (
                    <Badge className={`mb-4 ${getRoleBadgeColor(selectedStudent.role)}`}>
                      {getRoleFullName(selectedStudent.role)}
                    </Badge>
                  )}

                  <div className="w-full space-y-3 mt-4">
                    {/* Current Status Section */}
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Current Status</p>
                        </div>
                        {canEditStatus(selectedStudent) && !editingStatus && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingStatus(true)}>
                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        )}
                      </div>

                      {editingStatus ? (
                        <div className="space-y-3">
                          <Select value={statusForm.status_type} onValueChange={(v) => setStatusForm(f => ({ ...f, status_type: v }))}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Company / University"
                            value={statusForm.company}
                            onChange={(e) => setStatusForm(f => ({ ...f, company: e.target.value }))}
                            className="h-9"
                          />
                          <Input
                            placeholder="Job Title / Degree"
                            value={statusForm.job_title}
                            onChange={(e) => setStatusForm(f => ({ ...f, job_title: e.target.value }))}
                            className="h-9"
                          />
                          <Input
                            placeholder="Location (City, Country)"
                            value={statusForm.location}
                            onChange={(e) => setStatusForm(f => ({ ...f, location: e.target.value }))}
                            className="h-9"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => handleSaveStatus(selectedStudent)} disabled={savingStatus}>
                              {savingStatus ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingStatus(false)} disabled={savingStatus}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(() => {
                            const status = statuses[selectedStudent.id];
                            const statusType = status?.status_type || "Not Updated";
                            return (
                              <>
                                <Badge variant="outline" className={`${getStatusColor(statusType)}`}>
                                  {statusType}
                                </Badge>
                                {status?.job_title && (
                                  <p className="text-sm text-foreground flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                    {status.job_title}
                                  </p>
                                )}
                                {status?.company && (
                                  <p className="text-sm text-foreground flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    {status.company}
                                  </p>
                                )}
                                {status?.location && (
                                  <p className="text-sm text-foreground flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                    {status.location}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Batch */}
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Batch</p>
                        <p className="font-semibold text-foreground">{selectedStudent.batch}</p>
                      </div>
                    </div>

                    {selectedStudent.email && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                          <a href={`mailto:${selectedStudent.email}`} className="font-semibold text-primary hover:underline truncate block">
                            {selectedStudent.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedStudent.bio && (
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">About</p>
                          <p className="text-foreground leading-relaxed">{selectedStudent.bio}</p>
                        </div>
                      </div>
                    )}

                    {selectedStudent.created_at && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
                          <p className="font-semibold text-foreground">
                            {new Date(selectedStudent.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6 w-full">
                    {selectedStudent.email && (
                      <Button asChild className="flex-1">
                        <a href={`mailto:${selectedStudent.email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setSelectedStudent(null)} className="flex-1">
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDirectory;
