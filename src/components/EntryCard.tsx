"use client";

import { useState } from "react";
import { Clock, Droplets, StickyNote } from "lucide-react";
import { PhotoThumb } from "./PhotoThumb";
import { PhotoLightbox } from "./PhotoLightbox";
import type { Entry } from "@/lib/types";

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAI, setShowAI] = useState(false);

  const interactiveProps = onClick
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        },
      }
    : {};

  return (
    <div
      {...interactiveProps}
      className={`flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4 text-left shadow-sm shadow-purple-100 ring-1 ring-purple-50 transition ${
        onClick ? "cursor-pointer active:scale-[0.99] hover:ring-purple-200" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
          {entry.mealType}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-purple-300">
          <Clock className="h-3.5 w-3.5" />
          {entry.time}
        </span>
      </div>

      {entry.description && <p className="text-sm text-purple-900 whitespace-pre-wrap">{entry.description}</p>}

      {entry.water && (
        <div className="flex items-center gap-1.5 text-xs text-purple-500">
          <Droplets className="h-3.5 w-3.5" />
          <span>{entry.water}</span>
        </div>
      )}

      {entry.note && (
        <div className="flex items-start gap-1.5 text-xs text-purple-400">
          <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span className="whitespace-pre-wrap">{entry.note}</span>
        </div>
      )}

      {entry.photoUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pt-1">
          {entry.photoUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(i);
              }}
              className="shrink-0"
            >
              <PhotoThumb
                url={url}
                alt="รูปอาหาร"
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-purple-100"
              />
            </button>
          ))}
        </div>
      )}

      {entry.aiRiskLevel && entry.aiRiskLevel !== "none" && (
        <div className="mt-1 border-t border-purple-50 pt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAI(!showAI);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
            >
              <span>🤖 {showAI ? "ซ่อนความเห็น AI" : "ดูผลวิเคราะห์ AI"}</span>
            </button>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
              entry.aiRiskLevel === "high"
                ? "bg-rose-50 text-rose-600 ring-rose-200"
                : entry.aiRiskLevel === "medium"
                ? "bg-amber-50 text-amber-600 ring-amber-200"
                : "bg-emerald-50 text-emerald-600 ring-emerald-200"
            }`}>
              {entry.aiRiskLevel === "high"
                ? "เสี่ยงฟันผุสูง ⚠️"
                : entry.aiRiskLevel === "medium"
                ? "เสี่ยงฟันผุปานกลาง ⚠️"
                : "เสี่ยงฟันผุต่ำ ✨"}
            </span>
          </div>

          {showAI && entry.aiAnalysis && (
            <div className="rounded-xl bg-purple-50/50 p-3 text-xs text-purple-900 border border-purple-100/70 flex flex-col gap-2">
              {entry.aiAnalysis.foodItems && entry.aiAnalysis.foodItems.length > 0 && (
                <div>
                  <span className="font-bold text-purple-700">อาหารที่พบ: </span>
                  <span>{entry.aiAnalysis.foodItems.join(", ")}</span>
                </div>
              )}
              {entry.aiAnalysis.dentalAnalysis && (
                <div>
                  <span className="font-bold text-purple-700">ความเห็นทางทันตกรรม: </span>
                  <p className="mt-0.5 text-purple-800 leading-relaxed">{entry.aiAnalysis.dentalAnalysis}</p>
                </div>
              )}
              {entry.aiAnalysis.recommendation && (
                <div className="border-t border-purple-100/50 pt-1.5 mt-0.5">
                  <span className="font-bold text-emerald-700">คำแนะนำ: </span>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed font-medium">{entry.aiAnalysis.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          urls={entry.photoUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
