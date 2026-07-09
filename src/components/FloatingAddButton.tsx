import { Plus } from "lucide-react";

export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="เพิ่มมื้ออาหาร"
      className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg shadow-purple-300/70 transition active:scale-95 hover:bg-purple-600"
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
