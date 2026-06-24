import { Outlet } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Dark theme styled for premium SaaS look */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#09090b] border-r border-[#1a1a24] p-16 relative overflow-hidden text-white">
        {/* Glow effects */}
        <div className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{ 
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }} 
        />
        
        {/* Brand Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
        </div>

        {/* Copy / Message */}
        <div className="relative space-y-6 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]">
            Manage your work,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400">effortlessly.</span>
          </h1>
          <p className="text-zinc-400 text-lg font-light leading-relaxed">
            Organize projects, boards, and tasks in a unified workspace
            modeled after the finest engineering workflows.
          </p>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2 text-sm text-zinc-500 font-medium">
          <span>FastAPI & React Stack</span>
          <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
          <span>Production Ready</span>
        </div>
      </div>

      {/* Right Panel — Form area */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
