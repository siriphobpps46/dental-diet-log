"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Eye, RefreshCw } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { EntryFormModal } from "@/components/EntryFormModal";
import { ErrorCard } from "@/components/ErrorCard";
import { LoadingTooth } from "@/components/LoadingTooth";
import { Toast } from "@/components/Toast";
import { fetchEntriesByRange } from "@/lib/api";
import { formatThaiDateShort, isToday, toDateStr, todayDateStr } from "@/lib/date";
import { useToast } from "@/lib/useToast";
import type { Entry } from "@/lib/types";

const RANGE_DAYS = 60;

export default function HistoryPage() {
  const [selected, setSelected] = useState<Entry | null>(null);
  const { toast, notify } = useToast();

  const { data, error, mutate, isValidating } = useSWR<Entry[]>(
    ["entries", "history"],
    () => {
      const to = todayDateStr();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - RANGE_DAYS);
      return fetchEntriesByRange(toDateStr(fromDate), to);
    }
  );

  const entries = data ?? null;
  const loadError = error ?? null;
  const load = () => mutate();

  const groups = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({
        date,
        entries: list.sort((a, b) => b.time.localeCompare(a.time)),
      }));
  }, [entries]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-5 pt-8">
        <div>
          <h1 className="text-xl font-bold text-purple-900">ประวัติการบันทึก</h1>
          <p className="text-sm text-purple-400">ย้อนหลัง {RANGE_DAYS} วัน</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => mutate()}
            aria-label="รีเฟรช"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-purple-400 shadow-sm shadow-purple-100 ring-1 ring-purple-50 hover:text-purple-600"
          >
            <RefreshCw className={`h-5 w-5 ${isValidating ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/review"
            aria-label="ดูข้อมูลทั้งหมด"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-purple-400 shadow-sm shadow-purple-100 ring-1 ring-purple-50 hover:text-purple-600"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-5 pb-24 pt-6">
        {entries === null && !loadError && <LoadingTooth />}
        {loadError && <ErrorCard error={loadError} onRetry={load} />}
        {entries !== null && !loadError && groups.length === 0 && (
          <EmptyState
            pose="sleepy"
            title="ยังไม่มีประวัติการบันทึก"
            subtitle="เริ่มบันทึกมื้ออาหารจากหน้าแรกได้เลย"
          />
        )}
        {groups.map((group) => (
          <section key={group.date} className="flex flex-col gap-2.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-purple-500">
              {formatThaiDateShort(group.date)}
              {isToday(group.date) && (
                <span className="rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  วันนี้
                </span>
              )}
            </h2>
            <div className="flex flex-col gap-3">
              {group.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <BottomNav />
      <Toast toast={toast} />

      {selected && (
        <EntryFormModal
          key={selected.id}
          mode="edit"
          entry={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            notify("บันทึกแล้ว เก่งมาก 💜");
            load();
          }}
          onDeleted={() => {
            setSelected(null);
            notify("ลบแล้วนะ");
            load();
          }}
        />
      )}
    </div>
  );
}
