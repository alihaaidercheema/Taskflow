import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Circle,
} from "lucide-react";
import { projectsService, tasksService } from "../services";
import { useAuth } from "../context/AuthContext";
import { cn, formatRelativeTime } from "../lib/utils";



const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

function StatCard({ title, value, icon: Icon, color, description, isLoading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-all group-hover:scale-105", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value ?? 0}</p>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{description}</p>
          )}
        </>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-2 h-2 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll().then((r) => r.data),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const completedTasks = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const highPriorityTasks = tasks?.filter((t) => t.priority === "high" && t.status !== "completed").length ?? 0;
  const activeTasks = tasks?.filter((t) => t.status !== "completed").length ?? 0;
  const recentTasks = tasks
    ?.slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const stats = [
    {
      title: "Total Projects",
      value: projects?.length,
      icon: FolderKanban,
      color: "bg-violet-500/10 text-violet-500 border border-violet-500/10",
      description: "Active workspaces",
      isLoading: projectsLoading,
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: TrendingUp,
      color: "bg-blue-500/10 text-blue-500 border border-blue-500/10",
      description: "Tasks in progress",
      isLoading: tasksLoading,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckSquare,
      color: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/10",
      description: "Tasks finished",
      isLoading: tasksLoading,
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: "bg-rose-500/10 text-rose-500 border border-rose-500/10",
      description: "Needs attention",
      isLoading: tasksLoading,
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {greeting}, {user?.username || "there"} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            Here&apos;s a quick overview of your workspace today.
          </p>
        </div>
        <Link
          to="/projects"
          className="hidden sm:flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          View all projects <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Bottom Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : !recentTasks?.length ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/30">
              <CheckSquare className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2.5" />
              <p className="text-sm font-medium text-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground mt-1">Get started by creating your first task in the Tasks page.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/30 hover:border-muted-foreground/20 transition-all duration-150 gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Circle className={cn("w-2 h-2 shrink-0 fill-current", {
                      "text-muted-foreground": task.status === "todo",
                      "text-blue-500": task.status === "in_progress",
                      "text-emerald-500": task.status === "completed",
                    })} />
                    <p className={cn("text-[13px] font-semibold truncate text-foreground", task.status === "completed" && "line-through text-muted-foreground/70")}>
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider", 
                      task.priority === "high" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" :
                      task.priority === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/10" :
                      "bg-zinc-500/10 text-zinc-500 border-zinc-500/10"
                    )}>
                      {task.priority}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", 
                      task.status === "todo" ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/10" :
                      task.status === "in_progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/10" :
                      "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                    )}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : !projects?.length ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/30">
              <FolderKanban className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2.5" />
              <p className="text-sm font-medium text-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create projects on the Projects page.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project, i) => (
                <div
                  key={project.id}
                  className="px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/30 hover:border-muted-foreground/20 transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs",
                      ["bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"][i % 5]
                    )}>
                      {project.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{project.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {formatRelativeTime(project.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
