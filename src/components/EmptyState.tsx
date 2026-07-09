import { ToothMascot, type MascotPose } from "./ToothMascot";

interface EmptyStateProps {
  pose?: MascotPose;
  title: string;
  subtitle?: string;
}

export function EmptyState({ pose = "sleepy", title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/60 px-6 py-12 text-center">
      <ToothMascot pose={pose} className="h-24 w-24" />
      <p className="text-base font-semibold text-purple-900">{title}</p>
      {subtitle && <p className="text-sm text-purple-500">{subtitle}</p>}
    </div>
  );
}
