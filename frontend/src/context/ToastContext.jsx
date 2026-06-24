import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

const ToastContext = createContext(null);

let _id = 0;
const nextId = () => ++_id;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    container: "border-green-500/30 bg-green-500/10",
    icon: "text-green-500",
    title: "text-green-700 dark:text-green-400",
  },
  error: {
    container: "border-red-500/30 bg-red-500/10",
    icon: "text-red-500",
    title: "text-red-700 dark:text-red-400",
  },
  warning: {
    container: "border-yellow-500/30 bg-yellow-500/10",
    icon: "text-yellow-600",
    title: "text-yellow-700 dark:text-yellow-400",
  },
  info: {
    container: "border-primary/30 bg-primary/5",
    icon: "text-primary",
    title: "text-foreground",
  },
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 w-full max-w-sm rounded-xl border p-4 shadow-lg",
        "backdrop-blur-sm pointer-events-auto",
        "animate-toast-in",
        style.container
      )}
    >
      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", style.icon)} />
      <div className="flex-1 min-w-0 space-y-0.5">
        {toast.title && (
          <p className={cn("text-sm font-semibold leading-tight", style.title)}>
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5 opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    ({ type = "info", title, description, duration = 4000 }) => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, type, title, description }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast portal */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");

  return {
    toast: ctx.toast,
    dismiss: ctx.dismiss,
    success: (title, description) =>
      ctx.toast({ type: "success", title, description }),
    error: (title, description) =>
      ctx.toast({ type: "error", title, description }),
    warning: (title, description) =>
      ctx.toast({ type: "warning", title, description }),
    info: (title, description) =>
      ctx.toast({ type: "info", title, description }),
  };
}
