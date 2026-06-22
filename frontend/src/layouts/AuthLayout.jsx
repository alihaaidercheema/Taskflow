import { Outlet } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-card border-r border-border p-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            Manage your work,
            <br />
            <span className="text-primary">effortlessly.</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Organize projects, boards, and tasks in one beautiful workspace
            inspired by the best tools in the industry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Built with FastAPI & React</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>Open Source</span>
        </div>
      </div>

      {/* Right Panel — form area */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
