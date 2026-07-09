"use client";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-purple-950/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-xl animate-[sheet-up_0.2s_ease-out]">
        <h3 className="text-base font-bold text-purple-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-purple-400">{description}</p>}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-2xl bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-500 transition hover:bg-purple-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
