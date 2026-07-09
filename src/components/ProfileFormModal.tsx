"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { updateProfile } from "@/lib/api";
import type { Profile } from "@/lib/types";

interface ProfileFormModalProps {
  profile: Profile;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
}

export function ProfileFormModal({ profile, onClose, onSaved }: ProfileFormModalProps) {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  async function handleSave() {
    if (isSaving) return;
    setError(null);

    if (!name.trim()) {
      setError("กรอกชื่อ-นามสกุลก่อนนะ");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await updateProfile({ name: name.trim(), gender, birthDate });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-purple-950/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-xl animate-[sheet-up_0.2s_ease-out] sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-purple-900">ข้อมูลคนไข้</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="ปิด"
            className="rounded-full p-1.5 text-purple-400 hover:bg-purple-50 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="ชื่อ-นามสกุล">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นายศิริภพ พูนประสิทธิ์"
              className={inputClass}
            />
          </Field>

          <Field label="เพศ">
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
              <option value="">เลือกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </Field>

          <Field label="วันเกิด">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={`${inputClass} min-w-0`}
            />
          </Field>

          {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-300 transition hover:bg-purple-600 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-xs font-semibold text-purple-400">{label}</span>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 placeholder:text-purple-300 focus:border-purple-400 focus:outline-none";
