import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  LayoutGrid,
  CheckSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/boards", icon: LayoutGrid, label: "Boards" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo & Workspace Selector */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-primary to-indigo-600 shadow-sm shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 animate-fade-in">
            <span className="font-semibold text-sm tracking-tight text-foreground leading-none">
              TaskFlow
            </span>
            <span className="text-[10px] text-muted-foreground leading-normal font-medium mt-0.5">
              Personal Space
            </span>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {!collapsed && (
          <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase px-2">
            Workspace
          </div>
        )}
        <div className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-sidebar-accent text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {!collapsed && (
                <span className="truncate animate-fade-in">{label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout / User area */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 group"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {!collapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[70px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent shadow-xs transition-all hover:scale-105"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
