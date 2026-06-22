import { FolderKanban } from "lucide-react";

export default function Projects() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage all your projects.</p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Projects coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">Full CRUD with table view and dialogs.</p>
      </div>
    </div>
  );
}
