import { ToothMascot } from "./ToothMascot";

export function LoadingTooth({ label = "กำลังโหลด..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/60 px-6 py-12 text-center">
      <ToothMascot pose="smile" className="h-20 w-20 animate-[tooth-wiggle_0.9s_ease-in-out_infinite]" />
      <p className="text-sm font-medium text-purple-400">{label}</p>
    </div>
  );
}
