import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import TeachersTab from "@/components/admin/TeachersTab";
import StudentsTab from "@/components/admin/StudentsTab";
import GroupsTab from "@/components/admin/GroupsTab";
import MessagesTab from "@/components/admin/MessagesTab";
import GalleryTab from "@/components/admin/GalleryTab";
import VideosTab from "@/components/admin/VideosTab";
import ReunionTab from "@/components/admin/ReunionTab";
import EmailTab from "@/components/admin/EmailTab";
import ChatManagementTab from "@/components/admin/ChatManagementTab";

const AdminPanel = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin-login");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "teachers": return <TeachersTab />;
      case "students": return <StudentsTab />;
      case "groups": return <GroupsTab />;
      case "messages": return <MessagesTab />;
      case "gallery": return <GalleryTab />;
      case "videos": return <VideosTab />;
      case "chat": return <ChatManagementTab />;
      case "reunion": return <ReunionTab />;
      case "email": return <EmailTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-auto">
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminPanel;
