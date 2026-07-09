import { ToothMascot } from "./ToothMascot";
import { ApiConfigError } from "@/lib/api";

export function ErrorCard({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const isConfig = error instanceof ApiConfigError;
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-6 py-10 text-center">
      <ToothMascot pose="sleepy" className="h-20 w-20" />
      <p className="text-sm font-semibold text-purple-900">
        {isConfig ? "ยังไม่ได้เชื่อมต่อกับ Google Sheet" : "โหลดข้อมูลไม่สำเร็จ"}
      </p>
      <p className="text-xs text-purple-400">
        {isConfig ? "ตั้งค่า NEXT_PUBLIC_APPS_SCRIPT_URL ใน .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์" : error.message}
      </p>
      {!isConfig && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600"
        >
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}
