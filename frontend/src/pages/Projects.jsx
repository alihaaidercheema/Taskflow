import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { projectsService } from "../services";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

// ─── Dialog Components ────────────────────────────────────────────────────────

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

function ProjectForm({ initialData, onSubmit, onClose, isLoading }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required.";
    if (form.name.length > 255) errs.name = "Name must be under 255 characters.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Project Name <span className="text-destructive">*</span></label>
        <input
          autoFocus
          value={form.name}
          onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors({}); }}
          placeholder="e.g. Marketing Website"
          className={cn(
            "w-full px-3 py-2 text-[13px] bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60",
            errors.name ? "border-destructive" : "border-input"
          )}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description <span className="text-muted-foreground/70 font-normal lowercase">(optional)</span></label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe what this project is about..."
          rows={3}
          className="w-full px-3 py-2 text-[13px] bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60 resize-none"
        />
      </div>

      <div className="flex items-center gap-2.5 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-60 transition-all shadow-xs"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {initialData ? "Save Changes" : "Create Project"}
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

function DeleteConfirmation({ project, onConfirm, onClose, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
        <p className="text-xs text-destructive font-medium leading-relaxed">
          This will permanently delete <strong>&quot;{project.name}&quot;</strong> and all its boards and tasks. This action cannot be undone.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/95 disabled:opacity-60 transition-all"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Delete Project
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

// ─── Row Actions Menu ─────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-fade-in p-1">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-md text-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Projects Page ───────────────────────────────────────────────────────

export default function Projects() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  // Pagination state
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);

  // Reset skip when search term changes
  useEffect(() => {
    setSkip(0);
  }, [search]);

  // ── Queries & Mutations ──
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", limit, skip],
    queryFn: () => projectsService.getAll({ limit, skip }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setCreateOpen(false);
      toast.success("Project created", "Your new project has been added.");
    },
    onError: (err) => {
      toast.error("Failed to create project", err.response?.data?.detail || "Something went wrong.");
    },
  });

  const editMutation = useMutation({
    mutationFn: (data) => projectsService.update(editProject.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditProject(null);
      toast.success("Project updated", "Changes have been saved.");
    },
    onError: (err) => {
      toast.error("Failed to update project", err.response?.data?.detail || "Something went wrong.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.delete(deleteProject.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteProject(null);
      toast.success("Project deleted", "The project and its contents have been removed.");
    },
    onError: (err) => {
      toast.error("Failed to delete project", err.response?.data?.detail || "Something went wrong.");
    },
  });

  // ── Filtered projects ──
  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Projects</h1>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            Manage and organize your team workspaces.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="pl-9 pr-8 py-1.5 w-full text-[13px] bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
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

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Created At</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5"><div className="h-4 w-32 bg-muted rounded animate-pulse" /></td>
                  <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-4 w-48 bg-muted rounded animate-pulse" /></td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                  <td className="px-4 py-3.5"><div className="h-7 w-7 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center bg-card/30">
          <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          {search ? (
            <>
              <p className="text-sm font-semibold text-foreground">No results for &quot;{search}&quot;</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search query.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Get started by creating your first project workspace.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-4 flex items-center gap-1.5 h-9 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all mx-auto"
              >
                <Plus className="w-3.5 h-3.5" /> New Project
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                <th className="px-4 py-2.5 text-left font-semibold hidden md:table-cell">Description</th>
                <th className="px-4 py-2.5 text-left font-semibold hidden sm:table-cell">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Created At
                  </span>
                </th>
                <th className="px-4 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((project, i) => (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-0 hover:bg-accent/30 transition-all duration-150 group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs",
                        ["bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"][i % 5]
                      )}>
                        {project.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-[13px] text-foreground">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell max-w-xs">
                    <span className="truncate block font-medium">
                      {project.description || <span className="italic text-muted-foreground/40 font-normal">No description</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell whitespace-nowrap font-medium">
                    {formatDate(project.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <RowMenu
                      onEdit={() => setEditProject(project)}
                      onDelete={() => setDeleteProject(project)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border border-border bg-card p-3 rounded-xl shadow-xs text-xs text-muted-foreground mt-4">
        <div className="font-medium">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> projects
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0 || isLoading}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-[11px] text-foreground uppercase tracking-wider px-1">
            Skip {skip} / Limit {limit}
          </span>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={projects.length < limit || isLoading}
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 transition-all shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Dialog */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Project">
        <ProjectForm
          onSubmit={(data) => createMutation.mutate(data)}
          onClose={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
        {createMutation.isError && (
          <p className="mt-3 text-xs font-medium text-destructive">
            {createMutation.error?.response?.data?.detail || "Failed to create project."}
          </p>
        )}
      </Modal>

      {/* Edit Dialog */}
      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        {editProject && (
          <>
            <ProjectForm
              initialData={editProject}
              onSubmit={(data) => editMutation.mutate(data)}
              onClose={() => setEditProject(null)}
              isLoading={editMutation.isPending}
            />
            {editMutation.isError && (
              <p className="mt-3 text-xs font-medium text-destructive">
                {editMutation.error?.response?.data?.detail || "Failed to update project."}
              </p>
            )}
          </>
        )}
      </Modal>

      {/* Delete Dialog */}
      <Modal open={!!deleteProject} onClose={() => setDeleteProject(null)} title="Delete Project">
        {deleteProject && (
          <DeleteConfirmation
            project={deleteProject}
            onConfirm={() => deleteMutation.mutate()}
            onClose={() => setDeleteProject(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
