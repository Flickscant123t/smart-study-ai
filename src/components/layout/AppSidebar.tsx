import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  History, 
  Settings, 
  LogOut,
  Crown,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/thinkcap-logo.png";

interface User {
  email: string;
  isPremium: boolean;
}

interface AppSidebarProps {
  user: User;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Study", path: "/dashboard" },
  { icon: FileText, label: "Notes", path: "/dashboard" },
  { icon: History, label: "History", path: "/dashboard" },
];

const AppSidebar = ({ user }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("studyai_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="ThinkCap" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-foreground">
            Think<span className="text-primary">Cap</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:text-primary"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Premium Banner */}
      {!user.isPremium && (
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-dark/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock unlimited AI queries and premium features
            </p>
            <Button variant="default" size="sm" className="w-full" asChild>
              <Link to="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.isPremium ? (
                <span className="flex items-center gap-1 text-primary">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              ) : (
                "Free Plan"
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
            <Link to="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
