"use client";

import { useState } from "react";
import { Droplets, StickyNote } from "lucide-react";
import { PhotoThumb } from "./PhotoThumb";
import { PhotoLightbox } from "./PhotoLightbox";
import type { Entry } from "@/lib/types";

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
        <span className="text-xs font-medium text-purple-300">{entry.time}</span>
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
