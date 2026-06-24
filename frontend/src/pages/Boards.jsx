import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calendar,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { boardsService, projectsService } from "../services";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

// ─── Dialog Components ────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function BoardForm({ initialData, projects, onSubmit, onClose, isLoading }) {
  const [name, setName] = useState(initialData?.name || "");
  const [projectId, setProjectId] = useState(
    initialData?.project_id || (projects.length > 0 ? projects[0].id : "")
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Board name is required.";
    if (name.length > 255) errs.name = "Name must be under 255 characters.";
    if (!projectId && !initialData) errs.projectId = "Project selection is required.";
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
      name: name.trim(),
      ...(initialData ? {} : { project_id: Number(projectId) }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Board Name <span className="text-destructive">*</span>
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors({});
          }}
          placeholder="e.g. Sprint Backlog"
          className={cn(
            "w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground",
            errors.name ? "border-destructive" : "border-input"
          )}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {!initialData && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Project <span className="text-destructive">*</span>
          </label>
          {projects.length === 0 ? (
            <div className="p-3 text-xs border border-dashed border-border rounded-md text-muted-foreground bg-muted/20">
              No projects available. You must{" "}
              <Link to="/projects" className="text-primary hover:underline font-medium">
                create a project
              </Link>{" "}
              first.
            </div>
          ) : (
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setErrors({});
              }}
              className={cn(
                "w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                errors.projectId ? "border-destructive" : "border-input"
              )}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {errors.projectId && (
            <p className="text-xs text-destructive">{errors.projectId}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading || (projects.length === 0 && !initialData)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initialData ? "Save Changes" : "Create Board"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmation({ board, onConfirm, onClose, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
        <p className="text-sm text-destructive">
          This will permanently delete board <strong>&quot;{board.name}&quot;</strong> and all its tasks. This action cannot be undone.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-all"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Delete Board
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Row Actions Menu ─────────────────────────────────────────────────────────

function CardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
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
          <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-20 overflow-hidden animate-fade-in">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Boards Page ────────────────────────────────────────────────────────

export default function Boards() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editBoard, setEditBoard] = useState(null);
  const [deleteBoard, setDeleteBoard] = useState(null);

  // Fetch Projects (necessary for selecting when creating and mapping project names)
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsService.getAll().then((r) => r.data),
  });

  // Fetch Boards
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: () => boardsService.getAll().then((r) => r.data),
  });

  // Create board mutation
  const createMutation = useMutation({
    mutationFn: (data) => boardsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setCreateOpen(false);
      toast.success("Board created", "Your new board has been added.");
    },
    onError: (err) => {
      toast.error("Failed to create board", err.response?.data?.detail || "Something went wrong.");
    },
  });

  // Edit board mutation
  const editMutation = useMutation({
    mutationFn: (data) => boardsService.update(editBoard.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setEditBoard(null);
      toast.success("Board updated", "Changes have been saved.");
    },
    onError: (err) => {
      toast.error("Failed to update board", err.response?.data?.detail || "Something went wrong.");
    },
  });

  // Delete board mutation
  const deleteMutation = useMutation({
    mutationFn: () => boardsService.delete(deleteBoard.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setDeleteBoard(null);
      toast.success("Board deleted", "The board and its tasks have been removed.");
    },
    onError: (err) => {
      toast.error("Failed to delete board", err.response?.data?.detail || "Something went wrong.");
    },
  });

  // Map project ID to Project object for fast name lookups
  const projectMap = useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  // Filtered boards list
  const filtered = useMemo(() => {
    return boards.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesProject =
        projectFilter === "all" || String(b.project_id) === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [boards, search, projectFilter]);

  const isLoading = boardsLoading || projectsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLoading ? "Loading..." : `${boards.length} board${boards.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          disabled={projects.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards..."
            className="pl-9 pr-8 py-2 w-full text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
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

        {/* Project Selector Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 h-40 flex flex-col justify-between shadow-sm animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <LayoutGrid className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          {search || projectFilter !== "all" ? (
            <>
              <p className="text-sm font-medium">No boards match your filters</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing your search or choosing a different project.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">No boards yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a board to start organizing tasks inside your projects.
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                disabled={projects.length === 0}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all mx-auto disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> New Board
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filtered.map((board) => {
            const project = projectMap.get(board.project_id);
            return (
              <div
                key={board.id}
                className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-40 cursor-pointer"
              >
                <div className="space-y-1.5 pr-6">
                  {/* Board Title */}
                  <h3 className="font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {board.name}
                  </h3>

                  {/* Project association Badge */}
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-2 py-0.5">
                    <FolderKanban className="w-3 h-3 text-primary" />
                    <span className="truncate max-w-[150px]">
                      {project?.name || "Unknown Project"}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Metadata & Link */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(board.created_at)}
                  </span>
                  
                  {/* Link representation */}
                  <Link
                    to={`/tasks?board_id=${board.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline"
                  >
                    View tasks <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Dropdown Menu positioning */}
                <div className="absolute top-4 right-4">
                  <CardMenu
                    onEdit={() => setEditBoard(board)}
                    onDelete={() => setDeleteBoard(board)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Board">
        <BoardForm
          projects={projects}
          onSubmit={(data) => createMutation.mutate(data)}
          onClose={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
        {createMutation.isError && (
          <p className="mt-3 text-sm text-destructive">
            {createMutation.error?.response?.data?.detail || "Failed to create board."}
          </p>
        )}
      </Modal>

      {/* Edit Dialog */}
      <Modal open={!!editBoard} onClose={() => setEditBoard(null)} title="Edit Board">
        {editBoard && (
          <>
            <BoardForm
              initialData={editBoard}
              projects={projects}
              onSubmit={(data) => editMutation.mutate(data)}
              onClose={() => setEditBoard(null)}
              isLoading={editMutation.isPending}
            />
            {editMutation.isError && (
              <p className="mt-3 text-sm text-destructive">
                {editMutation.error?.response?.data?.detail || "Failed to update board."}
              </p>
            )}
          </>
        )}
      </Modal>

      {/* Delete Dialog */}
      <Modal open={!!deleteBoard} onClose={() => setDeleteBoard(null)} title="Delete Board">
        {deleteBoard && (
          <DeleteConfirmation
            board={deleteBoard}
            onConfirm={() => deleteMutation.mutate()}
            onClose={() => setDeleteBoard(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
