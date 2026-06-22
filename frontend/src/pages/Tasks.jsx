import { CheckSquare } from "lucide-react";

export default function Tasks() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View, filter, and manage all your tasks.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <CheckSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Tasks coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">
          Table & card views, filtering, pagination, drag & drop.
        </p>
      </div>
    </div>
  );
}
