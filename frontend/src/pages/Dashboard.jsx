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

const PRIORITY_STYLES = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const STATUS_STYLES = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

function StatCard({ title, value, icon: Icon, color, description, isLoading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight">{value ?? 0}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
      color: "bg-violet-500/10 text-violet-500",
      description: "Active workspaces",
      isLoading: projectsLoading,
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: TrendingUp,
      color: "bg-orange-500/10 text-orange-500",
      description: "Tasks in progress",
      isLoading: tasksLoading,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckSquare,
      color: "bg-green-500/10 text-green-500",
      description: "Tasks finished",
      isLoading: tasksLoading,
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: "bg-red-500/10 text-red-500",
      description: "Needs attention",
      isLoading: tasksLoading,
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user?.username || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>
        <Link
          to="/projects"
          className="hidden sm:flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
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
            <h2 className="text-base font-semibold">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : !recentTasks?.length ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <CheckSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Circle className={cn("w-2 h-2 shrink-0 fill-current", {
                      "text-muted-foreground": task.status === "todo",
                      "text-blue-500": task.status === "in_progress",
                      "text-green-500": task.status === "completed",
                    })} />
                    <p className={cn("text-sm font-medium truncate", task.status === "completed" && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PRIORITY_STYLES[task.priority])}>
                      {task.priority}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[task.status])}>
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
            <h2 className="text-base font-semibold">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : !projects?.length ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <FolderKanban className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project, i) => (
                <div
                  key={project.id}
                  className="px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0",
                      ["bg-violet-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-pink-500"][i % 5]
                    )}>
                      {project.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
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
