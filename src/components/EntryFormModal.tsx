"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { MealChips } from "./MealChips";
import { PhotoUploader } from "./PhotoUploader";
import { createEntry, deleteEntry, updateEntry } from "@/lib/api";
import { nowTimeStr, todayDateStr } from "@/lib/date";
import type { Entry, NewPhoto } from "@/lib/types";

interface EntryFormModalProps {
  mode: "add" | "edit";
  entry?: Entry;
  defaultDate?: string;
  onClose: () => void;
  onSaved: (entry: Entry) => void;
  onDeleted: (id: string) => void;
}

export function EntryFormModal({ mode, entry, defaultDate, onClose, onSaved, onDeleted }: EntryFormModalProps) {
  const [date, setDate] = useState(entry?.date ?? defaultDate ?? todayDateStr());
  const [time, setTime] = useState(entry?.time ?? nowTimeStr());
  const [mealType, setMealType] = useState(entry?.mealType ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [water, setWater] = useState(entry?.water ?? "");
  const [note, setNote] = useState(entry?.note ?? "");
  const [existingUrls, setExistingUrls] = useState<string[]>(entry?.photoUrls ?? []);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = isSaving || isDeleting;

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  async function handleSave() {
    if (busy) return;
    setError(null);

    const finalMealType = mealType.trim();
    if (!finalMealType) {
      setError("เลือกหรือพิมพ์มื้ออาหารก่อนนะ");
      return;
    }
    if (!description.trim() && !water.trim() && !note.trim() && existingUrls.length === 0 && newPhotos.length === 0) {
      setError("ลงรายละเอียดอย่างน้อยหนึ่งอย่าง (อาหาร/น้ำ/รูป/โน้ต)");
      return;
    }

    setIsSaving(true);
    try {
      const input = {
        id: entry?.id,
        date,
        time,
        mealType: finalMealType,
        description: description.trim(),
        water: water.trim(),
        note: note.trim(),
        photos: newPhotos,
        existingPhotoUrls: existingUrls,
      };
      const saved = mode === "edit" ? await updateEntry(input) : await createEntry(input);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (busy || !entry) return;
    const confirmed = window.confirm("ลบมื้อนี้เลยไหม? กู้คืนไม่ได้นะ");
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteEntry(entry.id);
      onDeleted(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ ลองใหม่อีกครั้งนะ");
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-purple-950/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-xl animate-[sheet-up_0.2s_ease-out] sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-purple-900">
            {mode === "edit" ? "แก้ไขมื้ออาหาร" : "เพิ่มมื้ออาหาร"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="ปิด"
            className="rounded-full p-1.5 text-purple-400 hover:bg-purple-50 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="วันที่">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} min-w-0`}
              />
            </Field>
            <Field label="เวลา">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${inputClass} min-w-0`}
              />
            </Field>
          </div>

          <Field label="มื้อ">
            <MealChips value={mealType} onChange={setMealType} />
          </Field>

          <Field label="อาหารที่ทาน">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ข้าวผัดกะเพราไก่ไข่ดาว, ผลไม้..."
              rows={3}
              className={inputClass}
            />
          </Field>

          <Field label="น้ำ / เครื่องดื่ม">
            <input
              type="text"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              placeholder="เช่น น้ำเปล่า 2 แก้ว, ชานมไข่มุก 1 แก้ว"
              className={inputClass}
            />
          </Field>

          <Field label="รูปภาพ">
            <PhotoUploader
              existingUrls={existingUrls}
              onRemoveExisting={(url) => setExistingUrls((prev) => prev.filter((u) => u !== url))}
              newPhotos={newPhotos}
              onAddPhotos={(photos) => setNewPhotos((prev) => [...prev, ...photos])}
              onRemoveNewPhoto={(index) => setNewPhotos((prev) => prev.filter((_, i) => i !== index))}
            />
          </Field>

          <Field label="โน้ตเพิ่มเติม">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="อาการ, ความรู้สึก, อื่น ๆ"
              rows={2}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

          <div className="mt-2 flex gap-3">
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-100 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                ลบ
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-300 transition hover:bg-purple-600 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-purple-400">{label}</span>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 placeholder:text-purple-300 focus:border-purple-400 focus:outline-none";
