import { useQuery } from "@tanstack/react-query";
import { FolderKanban, CheckSquare, AlertTriangle, TrendingUp } from "lucide-react";
import { projectsService, tasksService } from "../services";
import { cn } from "../lib/utils";

function StatCard({ title, value, icon: Icon, color, isLoading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold tracking-tight">{value ?? 0}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll().then((r) => r.data),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const completedTasks = tasks?.filter((t) => t.status === "completed").length;
  const highPriorityTasks = tasks?.filter((t) => t.priority === "high").length;
  const activeTasks = tasks?.filter((t) => t.status !== "completed").length;

  const stats = [
    {
      title: "Total Projects",
      value: projects?.length,
      icon: FolderKanban,
      color: "bg-blue-500/10 text-blue-500",
      isLoading: projectsLoading,
    },
    {
      title: "Active Tasks",
      value: activeTasks,
      icon: TrendingUp,
      color: "bg-orange-500/10 text-orange-500",
      isLoading: tasksLoading,
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckSquare,
      color: "bg-green-500/10 text-green-500",
      isLoading: tasksLoading,
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      icon: AlertTriangle,
      color: "bg-red-500/10 text-red-500",
      isLoading: tasksLoading,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Recent Projects</h2>
        {projectsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <FolderKanban className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects?.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
