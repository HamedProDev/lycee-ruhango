import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, FileText, GraduationCap, 
  Home, Settings, LogOut, ChevronDown, Menu
} from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import NewsManagement from "@/components/admin/NewsManagement";
import ApplicationsManagement from "@/components/admin/ApplicationsManagement";
import ProgramsManagement from "@/components/admin/ProgramsManagement";
import SettingsManagement from "@/components/admin/SettingsManagement";

type AdminView = "applications" | "news" | "programs" | "settings";

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>("applications");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin-login");
  };

  const getPageTitle = () => {
    switch (activeView) {
      case "applications": return "Student Applications";
      case "news": return "News Management";
      case "programs": return "Programs Management";
      case "settings": return "Settings";
      default: return "Dashboard";
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Lycée de Ruhango Ikirezi TSS</title>
      </Helmet>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"}`}>
          <div className="p-4 border-b border-border flex items-center gap-3">
            <img src={schoolLogo} alt="Logo" className="h-10 w-auto" />
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-sm font-poppins text-primary truncate">Lycée de Ruhango</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </div>
          
          <nav className="p-4 space-y-2">
            <Button 
              variant={activeView === "applications" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3"
              onClick={() => setActiveView("applications")}
            >
              <FileText className="w-5 h-5" />
              {sidebarOpen && "Applications"}
            </Button>
            <Button 
              variant={activeView === "news" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3"
              onClick={() => setActiveView("news")}
            >
              <Newspaper className="w-5 h-5" />
              {sidebarOpen && "News"}
            </Button>
            <Button 
              variant={activeView === "programs" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3"
              onClick={() => setActiveView("programs")}
            >
              <GraduationCap className="w-5 h-5" />
              {sidebarOpen && "Programs"}
            </Button>
            <Button 
              variant={activeView === "settings" ? "secondary" : "ghost"} 
              className="w-full justify-start gap-3"
              onClick={() => setActiveView("settings")}
            >
              <Settings className="w-5 h-5" />
              {sidebarOpen && "Settings"}
            </Button>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Home className="w-5 h-5" />
                {sidebarOpen && "Back to Site"}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && "Logout"}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold font-poppins text-foreground">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {user?.email?.[0].toUpperCase() || "A"}
              </div>
              <span className="hidden sm:block text-sm font-medium truncate max-w-[150px]">
                {user?.email || "Admin"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-4 lg:p-8">
            {activeView === "applications" && <ApplicationsManagement />}
            {activeView === "news" && <NewsManagement />}
            {activeView === "programs" && <ProgramsManagement />}
            {activeView === "settings" && <SettingsManagement />}
          </main>
        </div>
      </div>
    </>
  );
};

export default Admin;
