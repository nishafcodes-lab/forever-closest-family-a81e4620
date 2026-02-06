import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, Mail, GraduationCap, ArrowLeft, X, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedSection } from "@/components/ui/animated-section";

interface Student {
  id: string;
  name: string;
  batch: string;
  role: string | null;
  photo_url: string | null;
  bio: string | null;
  email: string | null;
  created_at?: string;
}

const StudentDirectory = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  // Get unique batches and roles for filters
  const batches = useMemo(() => {
    const uniqueBatches = [...new Set(students.map((s) => s.batch))];
    return uniqueBatches.sort();
  }, [students]);

  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(students.map((s) => s.role).filter(Boolean))];
    return uniqueRoles as string[];
  }, [students]);

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch;
      const matchesRole = selectedRole === "all" || student.role === selectedRole;

      return matchesSearch && matchesBatch && matchesRole;
    });
  }, [students, searchTerm, selectedBatch, selectedRole]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedRole("all");
  };

  const hasActiveFilters = searchTerm || selectedBatch !== "all" || selectedRole !== "all";

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "CRS":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "GRS":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  const getRoleFullName = (role: string | null) => {
    switch (role) {
      case "CRS":
        return "Class Representative";
      case "GRS":
        return "Group Representative";
      default:
        return role;
    }
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
            <div className="hidden md:flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{filteredStudents.length}</span>
              <span className="text-muted-foreground">shown</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <AnimatedSection className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>

              {/* Batch Filter */}
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
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
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
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="h-12">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
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
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "No students have been added yet"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="bg-card rounded-2xl border border-border p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                  {/* Photo */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={student.name}
                        className="w-full h-full rounded-full object-cover border-4 border-background shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-4xl border-4 border-background shadow-md">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Role Badge */}
                    {student.role && student.role !== "Student" && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Badge className={`text-xs ${getRoleBadgeColor(student.role)}`}>
                          {student.role}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {student.batch}
                    </p>

                    {student.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {student.bio}
                      </p>
                    )}

                    {student.email && (
                      <span className="inline-flex items-center gap-1 text-sm text-primary">
                        <Mail className="w-4 h-4" />
                        Contact
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredStudents.length > 0 && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </main>

      {/* Student Profile Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-lg">
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
                  {/* Large Photo */}
                  <div className="relative w-32 h-32 mb-6">
                    {selectedStudent.photo_url ? (
                      <img
                        src={selectedStudent.photo_url}
                        alt={selectedStudent.name}
                        className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-5xl border-4 border-primary/20 shadow-xl">
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name and Role */}
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedStudent.name}</h2>
                  {selectedStudent.role && (
                    <Badge className={`mb-4 ${getRoleBadgeColor(selectedStudent.role)}`}>
                      {getRoleFullName(selectedStudent.role)}
                    </Badge>
                  )}

                  {/* Info Cards */}
                  <div className="w-full space-y-3 mt-4">
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

                    {/* Email */}
                    {selectedStudent.email && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                          <a
                            href={`mailto:${selectedStudent.email}`}
                            className="font-semibold text-primary hover:underline truncate block"
                          >
                            {selectedStudent.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
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

                    {/* Member Since */}
                    {selectedStudent.created_at && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
                          <p className="font-semibold text-foreground">
                            {new Date(selectedStudent.created_at).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
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
