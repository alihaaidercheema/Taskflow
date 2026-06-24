import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calendar,
  List,
  Kanban,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  ClipboardList,
} from "lucide-react";
import { tasksService, boardsService, projectsService } from "../services";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  high: "bg-rose-500/10 text-rose-500 border-rose-500/10 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/10 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
  low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/10 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/20",
};

const STATUS_STYLES = {
  todo: "bg-zinc-500/10 text-zinc-500 border-zinc-500/10 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/10 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

// ─── Modal Dialog Component ───────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-xl animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-[14px] font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-6 py-5 bg-card">{children}</div>
      </div>
    </div>
  );
}

// ─── Task Form Component ──────────────────────────────────────────────────────

function TaskForm({ initialData, boards, projects, onSubmit, onClose, isLoading }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [status, setStatus] = useState(initialData?.status || "todo");
  const [boardId, setBoardId] = useState(
    initialData?.board_id || (boards.length > 0 ? boards[0].id : "")
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Task title is required.";
    if (title.length > 255) errs.title = "Title must be under 255 characters.";
    if (!boardId && !initialData) errs.boardId = "Board selection is required.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      ...(initialData ? {} : { board_id: Number(boardId) }),
    });
  };

  // Map project to boards for group representation
  const boardsByProject = useMemo(() => {
    const grouped = {};
    projects.forEach((p) => {
      grouped[p.id] = { project: p, boards: [] };
    });
    boards.forEach((b) => {
      if (grouped[b.project_id]) {
        grouped[b.project_id].boards.push(b);
      }
    });
    return Object.values(grouped).filter((g) => g.boards.length > 0);
  }, [boards, projects]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Task Title <span className="text-destructive">*</span>
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({});
          }}
          placeholder="e.g. Design Landing Page"
          className={cn(
            "w-full px-3 py-2 text-[13px] bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60",
            errors.title ? "border-destructive" : "border-input"
          )}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done?"
          rows={3}
          className="w-full px-3 py-2 text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all font-semibold"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all font-semibold"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {!initialData && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Board <span className="text-destructive">*</span>
          </label>
          {boards.length === 0 ? (
            <div className="p-3 text-xs border border-dashed border-border rounded-lg text-muted-foreground bg-muted/20">
              No boards available. Create a{" "}
              <Link to="/boards" className="text-primary hover:underline font-semibold">
                board
              </Link>{" "}
              first.
            </div>
          ) : (
            <select
              value={boardId}
              onChange={(e) => {
                setBoardId(e.target.value);
                setErrors({});
              }}
              className={cn(
                "w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all font-semibold",
                errors.boardId ? "border-destructive" : "border-input"
              )}
            >
              {boardsByProject.map((group) => (
                <optgroup key={group.project.id} label={group.project.name}>
                  {group.boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
          {errors.boardId && (
            <p className="text-xs text-destructive">{errors.boardId}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-2">
        <button
          type="submit"
          disabled={isLoading || (boards.length === 0 && !initialData)}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition-all shadow-xs"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initialData ? "Save Changes" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmation({ task, onConfirm, onClose, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
        <p className="text-xs text-destructive font-medium leading-relaxed">
          Are you sure you want to permanently delete task <strong>&quot;{task.title}&quot;</strong>? This action cannot be undone.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/95 disabled:opacity-60 transition-all"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Delete Task
        </button>
        <button
          onClick={onClose}
          className="h-9 px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Actions Dropdown Menu ───────────────────────────────────────────────────

function ActionsMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-fade-in p-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-md text-foreground hover:bg-accent transition-colors text-left"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Tasks Page ─────────────────────────────────────────────────────────

export default function Tasks() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialBoardParam = searchParams.get("board_id") || "all";

  // Views Toggle ("table" or "card")
  const [viewMode, setViewMode] = useState("card");
  const [activeDropCol, setActiveDropCol] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState(initialBoardParam);

  // Pagination states
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Dialog management
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  // Reset offset on filter changes
  useEffect(() => {
    setOffset(0);
  }, [filterStatus, filterPriority, projectFilter, boardFilter, search]);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll().then((r) => r.data),
  });

  // Fetch boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: () => boardsService.getAll().then((r) => r.data),
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", limit, offset, filterStatus, filterPriority],
    queryFn: () => {
      const params = { limit, offset };
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterPriority !== "all") params.priority = filterPriority;
      return tasksService.getAll(params).then((r) => r.data);
    },
  });

  // mutations
  const createMutation = useMutation({
    mutationFn: (data) => tasksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setCreateOpen(false);
      toast.success("Task created", "Your new task has been added.");
    },
    onError: (err) => {
      toast.error("Failed to create task", err.response?.data?.detail || "Something went wrong.");
    },
  });

  const editMutation = useMutation({
    mutationFn: (data) => tasksService.update(editTask.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditTask(null);
      toast.success("Task updated", "Changes have been saved.");
    },
    onError: (err) => {
      toast.error("Failed to update task", err.response?.data?.detail || "Something went wrong.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksService.delete(deleteTask.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteTask(null);
      toast.success("Task deleted", "The task has been permanently removed.");
    },
    onError: (err) => {
      toast.error("Failed to delete task", err.response?.data?.detail || "Something went wrong.");
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksService.update(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      const label = variables.status === "completed" ? "completed" : variables.status === "in_progress" ? "started" : "reopened";
      toast.info("Status updated", `Task ${label} successfully.`);
    },
    onError: () => {
      toast.error("Status update failed", "Could not update task status.");
    },
  });

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setActiveDropCol(status);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Reset hover class when leaving the column
    setActiveDropCol(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = Number(e.dataTransfer.getData("text/plain"));
    if (taskId) {
      const taskObj = filteredTasks.find((t) => t.id === taskId);
      if (taskObj && taskObj.status !== newStatus) {
        quickStatusMutation.mutate({ id: taskId, status: newStatus });
      }
    }
  };

  // Fast mapping utilities
  const boardMap = useMemo(() => new Map(boards.map((b) => [b.id, b])), [boards]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Filter boards that match the selected project filter
  const filteredBoardsSelect = useMemo(() => {
    if (projectFilter === "all") return boards;
    return boards.filter((b) => String(b.project_id) === projectFilter);
  }, [boards, projectFilter]);

  // Apply client-side board/project & search filters on tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesBoard = boardFilter === "all" || String(t.board_id) === boardFilter;

      let matchesProject = true;
      if (projectFilter !== "all") {
        const boardObj = boardMap.get(t.board_id);
        matchesProject = boardObj && String(boardObj.project_id) === projectFilter;
      }

      return matchesSearch && matchesBoard && matchesProject;
    });
  }, [tasks, search, boardFilter, projectFilter, boardMap]);

  // Group tasks for Kanban/Card columns representation
  const groupedTasks = useMemo(() => {
    const groups = { todo: [], in_progress: [], completed: [] };
    filteredTasks.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].push(t);
      }
    });
    return groups;
  }, [filteredTasks]);

  const isLoading = tasksLoading || boardsLoading || projectsLoading;

  // Pagination triggers
  const handlePrevPage = () => {
    if (offset - limit >= 0) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    // If the amount of retrieved tasks equals limit, assume there might be a next page
    if (tasks.length === limit) {
      setOffset(offset + limit);
    }
  };

  const TaskCard = ({ task }) => {
    const board = boardMap.get(task.board_id);

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        className="group relative rounded-xl border border-border bg-card p-4 shadow-xs hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-grab active:cursor-grabbing active:scale-[0.99]"
      >
        <div className="space-y-1">
          <h4 className="font-bold text-[13px] text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-2 pr-4">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-border/50 pt-2.5 text-[10px] font-semibold">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Priority Badge */}
            <span
              className={cn(
                "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                PRIORITY_STYLES[task.priority]
              )}
            >
              {task.priority}
            </span>

            {/* Board Location Badge */}
            {board && (
              <span className="flex items-center gap-1 text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border">
                <FolderKanban className="w-2.5 h-2.5 text-primary" />
                <span className="max-w-[85px] truncate">{board.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
              {formatDate(task.created_at)}
            </span>

            {/* Micro status toggle buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {task.status === "todo" && (
                <button
                  onClick={() =>
                    quickStatusMutation.mutate({ id: task.id, status: "in_progress" })
                  }
                  className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[9px] font-bold transition-colors"
                >
                  Start
                </button>
              )}
              {task.status === "in_progress" && (
                <button
                  onClick={() =>
                    quickStatusMutation.mutate({ id: task.id, status: "completed" })
                  }
                  className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[9px] font-bold transition-colors"
                >
                  Complete
                </button>
              )}
              {task.status === "completed" && (
                <button
                  onClick={() =>
                    quickStatusMutation.mutate({ id: task.id, status: "in_progress" })
                  }
                  className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-accent text-[9px] font-bold transition-colors"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-3.5 right-3" onClick={(e) => e.stopPropagation()}>
          <ActionsMenu
            onEdit={() => setEditTask(task)}
            onDelete={() => setDeleteTask(task)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Tasks</h1>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            {isLoading ? "Loading..." : `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""} listed`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          disabled={boards.length === 0}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col gap-4 border border-border bg-card p-4 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3.5">
          {/* View Toggle */}
          <div className="flex items-center bg-muted/40 border border-border p-0.5 rounded-lg shrink-0 select-none">
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-semibold",
                viewMode === "card" && "bg-card text-foreground shadow-xs"
              )}
              title="Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-semibold",
                viewMode === "table" && "bg-card text-foreground shadow-xs"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 pr-8 py-1.5 w-full text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-border hidden md:block" />

          {/* Direct filter dropdown lists */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Project filter */}
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setBoardFilter("all");
              }}
              className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Board filter */}
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
            >
              <option value="all">All Boards</option>
              {filteredBoardsSelect.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content View modes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="h-28 rounded-xl border border-border bg-card p-4 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center bg-card/30">
          <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query, filters, or create a new task.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            disabled={boards.length === 0}
            className="mt-4 flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all mx-auto disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>
      ) : viewMode === "card" ? (
        /* Board / Kanban View */
        <>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium select-none">
            <span className="inline-flex items-center gap-1 bg-muted/60 border border-border px-2 py-0.5 rounded-md font-semibold text-[10px]">
              ✦ Drag
            </span>
            cards between columns to update their status instantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* To Do Column */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, "todo")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "todo")}
              className={cn(
                "space-y-4 border p-4 rounded-xl min-h-[450px] transition-all duration-150",
                activeDropCol === "todo"
                  ? "bg-muted/40 border-muted-foreground/30 scale-[1.01] ring-2 ring-muted-foreground/5"
                  : "bg-muted/15 border-border/80"
              )}
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h3 className="font-semibold text-xs flex items-center gap-2 text-foreground uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground bg-transparent" />
                  To Do
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/70">
                  {groupedTasks.todo.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.todo.length === 0 && activeDropCol === "todo" && (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-20 flex items-center justify-center text-[11px] text-muted-foreground font-semibold bg-muted/10">
                    Drop here
                  </div>
                )}
                {groupedTasks.todo.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, "in_progress")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "in_progress")}
              className={cn(
                "space-y-4 border p-4 rounded-xl min-h-[450px] transition-all duration-150",
                activeDropCol === "in_progress"
                  ? "bg-blue-500/5 border-blue-400/30 scale-[1.01] ring-2 ring-blue-500/5"
                  : "bg-muted/15 border-border/80"
              )}
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h3 className="font-semibold text-xs flex items-center gap-2 text-foreground uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-transparent relative">
                    <span className="absolute inset-0.5 rounded-full bg-blue-500/50" />
                  </span>
                  In Progress
                </h3>
                <span className="text-[10px] font-bold text-blue-500 px-2 py-0.5 rounded-md bg-blue-500/10">
                  {groupedTasks.in_progress.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.in_progress.length === 0 && activeDropCol === "in_progress" && (
                  <div className="border-2 border-dashed border-blue-400/20 rounded-lg h-20 flex items-center justify-center text-[11px] text-blue-400 font-semibold bg-blue-500/5">
                    Drop here
                  </div>
                )}
                {groupedTasks.in_progress.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, "completed")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "completed")}
              className={cn(
                "space-y-4 border p-4 rounded-xl min-h-[450px] transition-all duration-150",
                activeDropCol === "completed"
                  ? "bg-emerald-500/5 border-emerald-400/30 scale-[1.01] ring-2 ring-emerald-500/5"
                  : "bg-muted/15 border-border/80"
              )}
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h3 className="font-semibold text-xs flex items-center gap-2 text-foreground uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-none" />
                  Completed
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {groupedTasks.completed.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.completed.length === 0 && activeDropCol === "completed" && (
                  <div className="border-2 border-dashed border-emerald-400/20 rounded-lg h-20 flex items-center justify-center text-[11px] text-emerald-500 font-semibold bg-emerald-500/5">
                    Drop here
                  </div>
                )}
                {groupedTasks.completed.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Table / List View */
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-semibold">Title</th>
                <th className="px-4 py-2.5 text-left font-semibold hidden sm:table-cell">Location</th>
                <th className="px-4 py-2.5 text-left font-semibold">Priority</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-left font-semibold hidden md:table-cell text-muted-foreground">Created At</th>
                <th className="px-4 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const board = boardMap.get(task.board_id);
                const project = board ? projectMap.get(board.project_id) : null;
                return (
                  <tr
                    key={task.id}
                    className="border-b border-border last:border-0 hover:bg-accent/30 transition-all duration-150 group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className={cn("font-semibold text-[13px] text-foreground", task.status === "completed" && "line-through text-muted-foreground/70")}>
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 max-w-md font-medium">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap font-medium">
                      {board && (
                        <div className="flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>
                            {project?.name} / {board.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                          PRIORITY_STYLES[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase",
                          STATUS_STYLES[task.status]
                        )}
                      >
                        {STATUS_LABELS[task.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap font-medium">
                      {formatDate(task.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionsMenu
                        onEdit={() => setEditTask(task)}
                        onDelete={() => setDeleteTask(task)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border border-border bg-card p-3 rounded-xl shadow-xs text-xs text-muted-foreground">
        <div className="font-medium">
          Showing <span className="font-semibold text-foreground">{filteredTasks.length}</span> tasks
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={offset === 0 || isLoading}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-[11px] text-foreground uppercase tracking-wider px-1">
            Offset {offset} / Limit {limit}
          </span>
          <button
            onClick={handleNextPage}
            disabled={tasks.length < limit || isLoading}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 transition-all shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Dialog */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Task">
        <TaskForm
          boards={boards}
          projects={projects}
          onSubmit={(data) => createMutation.mutate(data)}
          onClose={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
        {createMutation.isError && (
          <p className="mt-3 text-xs font-medium text-destructive">
            {createMutation.error?.response?.data?.detail || "Failed to create task."}
          </p>
        )}
      </Modal>

      {/* Edit Dialog */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <>
            <TaskForm
              initialData={editTask}
              boards={boards}
              projects={projects}
              onSubmit={(data) => editMutation.mutate(data)}
              onClose={() => setEditTask(null)}
              isLoading={editMutation.isPending}
            />
            {editMutation.isError && (
              <p className="mt-3 text-xs font-medium text-destructive">
                {editMutation.error?.response?.data?.detail || "Failed to update task."}
              </p>
            )}
          </>
        )}
      </Modal>

      {/* Delete Dialog */}
      <Modal open={!!deleteTask} onClose={() => setDeleteTask(null)} title="Delete Task">
        {deleteTask && (
          <DeleteConfirmation
            task={deleteTask}
            onConfirm={() => deleteMutation.mutate()}
            onClose={() => setDeleteTask(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
