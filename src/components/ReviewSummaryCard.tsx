"use client";

import { useMemo } from "react";
import { CalendarCheck, ChartBar, Candy } from "lucide-react";
import { daysBetweenInclusive } from "@/lib/date";
import type { Entry } from "@/lib/types";

interface ReviewSummaryCardProps {
  entries: Entry[];
  from: string;
  to: string;
}

const RISK_KEYWORDS = [
  "หวาน",
  "น้ำตาล",
  "น้ำอัดลม",
  "โซดา",
  "ชานมไข่มุก",
  "ชาไข่มุก",
  "เค้ก",
  "คุกกี้",
  "ลูกอม",
  "ท็อฟฟี่",
  "ช็อกโกแลต",
  "ไอศกรีม",
  "เยลลี่",
  "ขนมหวาน",
  "น้ำหวาน",
  "บิงซู",
  "โดนัท",
  "เบเกอรี่",
  "น้ำผลไม้",
  "ชาเย็น",
  "กาแฟเย็น",
];

function hasRiskKeyword(entry: Entry): boolean {
  const text = `${entry.description} ${entry.water}`;
  return RISK_KEYWORDS.some((keyword) => text.includes(keyword));
}

function isEntryRisky(entry: Entry): boolean {
  if (entry.aiRiskLevel && entry.aiRiskLevel !== "none") {
    return entry.aiRiskLevel === "high" || entry.aiRiskLevel === "medium";
  }
  return hasRiskKeyword(entry);
}

export function ReviewSummaryCard({ entries, from, to }: ReviewSummaryCardProps) {
  const summary = useMemo(() => {
    const totalDays = daysBetweenInclusive(from, to);
    const loggedDays = new Set(entries.map((e) => e.date)).size;

    const mealCounts = new Map<string, number>();
    for (const entry of entries) {
      mealCounts.set(entry.mealType, (mealCounts.get(entry.mealType) ?? 0) + 1);
    }
    const meals = Array.from(mealCounts.entries()).sort((a, b) => b[1] - a[1]);
    const maxMealCount = meals[0]?.[1] ?? 0;

    const riskCount = entries.filter(isEntryRisky).length;

    return { totalDays, loggedDays, meals, maxMealCount, riskCount };
  }, [entries, from, to]);

  const compliancePct = summary.totalDays > 0 ? Math.round((summary.loggedDays / summary.totalDays) * 100) : 0;
  const riskPct = entries.length > 0 ? Math.round((summary.riskCount / entries.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-purple-100 ring-1 ring-purple-50">
      <div className="flex items-center gap-2 border-b border-purple-50 pb-2">
        <ChartBar className="h-4 w-4 text-purple-400" />
        <h2 className="font-bold text-sm text-purple-900">สรุปภาพรวม</h2>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <CalendarCheck className="h-4 w-4 shrink-0 text-purple-400" />
        <span className="text-purple-500">
          บันทึกแล้ว <span className="font-bold text-purple-900">{summary.loggedDays}</span> จาก{" "}
          {summary.totalDays} วัน ({compliancePct}%)
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Candy className="h-4 w-4 shrink-0 text-purple-400" />
        <span className="text-purple-500">
          พบมื้ออาหารเสี่ยงฟันผุ <span className="font-bold text-purple-900">{summary.riskCount}</span>{" "}
          ครั้ง จาก {entries.length} รายการ ({riskPct}%)
        </span>
      </div>

      {summary.meals.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          {summary.meals.map(([mealType, count]) => (
            <div key={mealType} className="flex items-center gap-2 text-xs">
              <span className="w-16 shrink-0 truncate text-purple-500">{mealType}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-purple-50">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${(count / summary.maxMealCount) * 100}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right font-bold text-purple-900">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
