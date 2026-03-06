import { 
  Users, GraduationCap, UsersRound, MessageCircle, 
  Image, Calendar, Mail, LogOut, Home, Video, MessagesSquare, UserCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "users", label: "User Approvals", icon: UserCheck },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "students", label: "Students", icon: Users },
  { id: "groups", label: "Student Groups", icon: UsersRound },
  { id: "messages", label: "Reviews", icon: MessageCircle },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
  { id: "chat", label: "Chat Management", icon: MessagesSquare },
  { id: "reunion", label: "Reunion Info", icon: Calendar },
  { id: "email", label: "Send Email", icon: Mail },
];

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) => {
  return (
    <aside className="w-16 md:w-64 bg-card border-r border-border min-h-screen p-2 md:p-4 flex flex-col flex-shrink-0">
      <div className="mb-8 hidden md:block">
        <h1 className="font-display text-xl font-bold gradient-text">Admin Panel</h1>
        <p className="text-xs text-muted-foreground">BSCS 2021-2025</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={item.label}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        <a
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">View Site</span>
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
