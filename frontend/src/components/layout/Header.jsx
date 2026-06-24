import { Sun, Moon, Bell, Search, User, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background/80 backdrop-blur-md shrink-0 select-none">
      {/* Search */}
      <div className="relative flex items-center group">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-9 pr-12 py-1.5 w-60 sm:w-72 text-[13px] bg-muted/40 hover:bg-muted/70 rounded-md border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[9px] text-muted-foreground font-semibold pointer-events-none opacity-80">
          <span>⌘</span><span>K</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-border mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white text-[11px] font-semibold shadow-xs">
              {(user?.username || user?.email)?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[13px] font-medium text-foreground hidden sm:block max-w-[120px] truncate">
              {user?.username || user?.email || "User"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                <p className="text-[13px] font-semibold truncate mt-0.5">{user?.username || user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-md text-foreground hover:bg-accent transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
