import { ToothMascot } from "./ToothMascot";
import type { ToastState } from "@/lib/useToast";

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      className="fixed top-4 z-50 left-1/2 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lg shadow-purple-200/60 ring-1 ring-purple-100 animate-[toast-in_0.25s_ease-out_forwards]"
    >
      <ToothMascot pose="smile" className="h-8 w-8 shrink-0" />
      <span className="text-sm font-semibold text-purple-900">{toast.message}</span>
    </div>
  );
}
