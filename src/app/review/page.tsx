"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { ErrorCard } from "@/components/ErrorCard";
import { LoadingTooth } from "@/components/LoadingTooth";
import { ToothMascot } from "@/components/ToothMascot";
import { fetchEntriesByRange } from "@/lib/api";
import { formatThaiDateShort, toDateStr, todayDateStr } from "@/lib/date";
import type { Entry } from "@/lib/types";

const DEFAULT_RANGE_DAYS = 90;

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_RANGE_DAYS);
  return toDateStr(d);
}

export default function ReviewPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(todayDateStr);
  const [activeMealTypes, setActiveMealTypes] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await fetchEntriesByRange(from, to);
      setEntries(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err : new Error("โหลดข้อมูลไม่สำเร็จ"));
    }
  }, [from, to]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await fetchEntriesByRange(from, to);
        if (!ignore) setEntries(data);
      } catch (err) {
        if (!ignore) setLoadError(err instanceof Error ? err : new Error("โหลดข้อมูลไม่สำเร็จ"));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [from, to]);

  const mealTypes = useMemo(() => {
    if (!entries) return [];
    return Array.from(new Set(entries.map((e) => e.mealType))).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    if (activeMealTypes.size === 0) return entries;
    return entries.filter((e) => activeMealTypes.has(e.mealType));
  }, [entries, activeMealTypes]);

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({
        date,
        entries: list.sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [filtered]);

  function toggleMealType(type: string) {
    setActiveMealTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col pb-10">
      <header className="mx-auto w-full max-w-lg px-5 pt-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-600"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>
        <div className="flex items-center gap-3">
          <ToothMascot pose="smile" className="h-12 w-12 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-purple-900">ข้อมูลทั้งหมด</h1>
            <p className="text-sm text-purple-400">สำหรับดูภาพรวม แก้ไขจากหน้านี้ไม่ได้</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-5 pt-6">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-purple-100 ring-1 ring-purple-50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-purple-400">จากวันที่</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={`${filterInputClass} min-w-0`}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-purple-400">ถึงวันที่</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={`${filterInputClass} min-w-0`}
              />
            </label>
          </div>

          {mealTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveMealTypes(new Set())}
                className={chipClass(activeMealTypes.size === 0)}
              >
                ทั้งหมด
              </button>
              {mealTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleMealType(type)}
                  className={chipClass(activeMealTypes.has(type))}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {entries === null && !loadError && <LoadingTooth />}
        {loadError && <ErrorCard error={loadError} onRetry={load} />}
        {entries !== null && !loadError && groups.length === 0 && (
          <EmptyState pose="sleepy" title="ไม่พบข้อมูลในช่วงที่เลือก" subtitle="ลองปรับวันที่หรือตัวกรองดูนะ" />
        )}
        {groups.map((group) => (
          <section key={group.date} className="flex flex-col gap-2.5">
            <h2 className="text-sm font-bold text-purple-500">{formatThaiDateShort(group.date)}</h2>
            <div className="flex flex-col gap-3">
              {group.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

const filterInputClass =
  "w-full rounded-2xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 focus:border-purple-400 focus:outline-none";

function chipClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-purple-500 text-white shadow-sm shadow-purple-300"
      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
  }`;
}
