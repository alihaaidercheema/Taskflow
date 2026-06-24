import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="pb-2 border-b border-border/60">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
          Manage your profile and workspace preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile Workspace</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white text-lg font-bold shadow-sm">
            {(user?.username || user?.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user?.username}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appearance</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Theme Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize the appearance of your TaskFlow workspace. Currently in <span className="capitalize font-semibold text-primary">{theme}</span> mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 h-9 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-all shadow-xs shrink-0"
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    </div>
  );
}
