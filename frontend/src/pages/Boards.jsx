import { LayoutGrid } from "lucide-react";

export default function Boards() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your boards.</p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <LayoutGrid className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Boards coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">Full CRUD with card layout.</p>
      </div>
    </div>
  );
}
