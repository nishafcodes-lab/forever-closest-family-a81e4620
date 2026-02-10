import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, UsersRound, MessageCircle, Image, Calendar } from "lucide-react";

interface Stats {
  teachers: number;
  students: number;
  groups: number;
  pendingMessages: number;
  galleryPhotos: number;
}

const DashboardTab = () => {
  const [stats, setStats] = useState<Stats>({
    teachers: 0,
    students: 0,
    groups: 0,
    pendingMessages: 0,
    galleryPhotos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [teachersRes, studentsRes, groupsRes, messagesRes, galleryRes] = await Promise.all([
      supabase.from("teachers").select("id", { count: "exact", head: true }),
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("student_groups").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("gallery").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      teachers: teachersRes.count || 0,
      students: studentsRes.count || 0,
      groups: groupsRes.count || 0,
      pendingMessages: messagesRes.count || 0,
      galleryPhotos: galleryRes.count || 0,
    });
    setLoading(false);
  };

  const statCards = [
    { label: "Teachers", value: stats.teachers, icon: GraduationCap, color: "text-primary" },
    { label: "Students", value: stats.students, icon: Users, color: "text-secondary" },
    { label: "Groups", value: stats.groups, icon: UsersRound, color: "text-accent" },
    { label: "Pending Messages", value: stats.pendingMessages, icon: MessageCircle, color: "text-orange-500" },
    { label: "Gallery Photos", value: stats.galleryPhotos, icon: Image, color: "text-green-500" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-display text-lg font-semibold mb-4">Welcome to BSCS Admin Panel</h3>
        <div className="space-y-2 text-muted-foreground">
          <p>🎓 <strong>Class:</strong> "The Worst Class of the Whole College" 😎</p>
          <p>🏫 <strong>College:</strong> Government Graduate College Khanpur (KFUEIT)</p>
          <p>📅 <strong>Session:</strong> 2021–2025</p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-medium text-foreground mb-2">GRs:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Iqra Aslam</li>
              <li>Tahira Mustaq</li>
              <li>Fizz Asghar</li>
            </ul>
          </div>
          <div className="mt-4">
            <p className="font-medium text-foreground mb-2">CRs:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Saqib</li>
              <li>Hamza</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
