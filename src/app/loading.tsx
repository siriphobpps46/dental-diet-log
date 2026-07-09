import { ToothMascot } from "@/components/ToothMascot";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <ToothMascot pose="smile" className="h-24 w-24 animate-[tooth-wiggle_0.9s_ease-in-out_infinite]" />
      <p className="text-sm font-medium text-purple-400">กำลังโหลด...</p>
    </div>
  );
}
