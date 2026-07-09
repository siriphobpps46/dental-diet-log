"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { ErrorCard } from "@/components/ErrorCard";
import { LoadingTooth } from "@/components/LoadingTooth";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ReviewSummaryCard } from "@/components/ReviewSummaryCard";
import { ToothMascot } from "@/components/ToothMascot";
import { fetchEntriesByRange, fetchProfile } from "@/lib/api";
import { calculateAge, formatThaiDateShort, isToday, toDateStr, todayDateStr } from "@/lib/date";
import type { Entry, Profile } from "@/lib/types";

const DEFAULT_RANGE_DAYS = 90;

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_RANGE_DAYS);
  return toDateStr(d);
}

export default function ReviewPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(todayDateStr);
  const [activeMealTypes, setActiveMealTypes] = useState<Set<string>>(new Set());

  const { data, error, mutate } = useSWR<Entry[]>(
    ["entries", "range", from, to],
    () => fetchEntriesByRange(from, to)
  );

  const { data: profile } = useSWR<Profile>(["profile"], fetchProfile);

  const entries = data ?? null;
  const loadError = error ?? null;
  const load = () => mutate();
  const age = profile ? calculateAge(profile.birthDate) : null;

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
        entries: list.sort((a, b) => b.time.localeCompare(a.time)),
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
        <div className="flex items-center gap-3">
          <ToothMascot pose="smile" className="h-12 w-12 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-purple-900">Dental Diet Log</h1>
            <p className="text-xs font-semibold text-purple-400">รายงานบันทึกอาหารสำหรับการรักษาทันตกรรม</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pt-6">
        <PullToRefresh onRefresh={load}>
          <div className="flex flex-col gap-4">
            {/* Dentist/Reviewer Greeting Card */}
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-purple-100 ring-1 ring-purple-50">
              <div className="flex items-center justify-between border-b border-purple-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h2 className="font-bold text-sm text-purple-900">รายงานบันทึกอาหาร</h2>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-600">
                  คนไข้
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400 font-medium">ชื่อ-นามสกุล</span>
                  <span className="font-bold text-purple-900">{profile?.name || "-"}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400 font-medium">เพศ / อายุ</span>
                  <span className="font-bold text-purple-900">
                    {profile?.gender || "-"} / {age !== null ? `${age} ปี` : "-"}
                  </span>
                </div>

                <div className="mt-1 border-t border-purple-50 pt-2 flex flex-col gap-1.5 text-[11px] text-purple-500">
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-300 select-none">•</span>
                    <span>ประวัติย้อนหลังเพื่อประกอบการวางแผนและติดตามการรักษา</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-300 select-none">•</span>
                    <span>กรองช่วงเวลาและประเภทมื้ออาหารเพื่อตรวจสอบข้อมูล</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-purple-100 ring-1 ring-purple-50">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-xs font-semibold text-purple-400">จากวันที่</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={`${filterInputClass} min-w-0`}
                  />
                </label>
                <label className="flex flex-col gap-1.5 min-w-0">
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
            {entries !== null && !loadError && entries.length > 0 && (
              <ReviewSummaryCard entries={entries} from={from} to={to} />
            )}
            {entries !== null && !loadError && groups.length > 0 && (
              <p className="text-xs font-medium text-purple-400">
                พบ {filtered.length} รายการ ใน {groups.length} วัน
              </p>
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
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </PullToRefresh>
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
