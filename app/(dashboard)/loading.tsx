import { Loader2 } from "lucide-react";

export default function DashboardGlobalLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center animate-pulse shadow-lg border border-[var(--color-border)]">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-muted)] animate-pulse">
        Memuat data...
      </p>
    </div>
  );
}
