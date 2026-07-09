import { Droplets, StickyNote } from "lucide-react";
import { toDisplayPhotoUrl } from "@/lib/api";
import type { Entry } from "@/lib/types";

export function EntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4 text-left shadow-sm shadow-purple-100 ring-1 ring-purple-50 transition active:scale-[0.99] hover:ring-purple-200"
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
          {entry.photoUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={toDisplayPhotoUrl(url)}
              alt="รูปอาหาร"
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-purple-100"
            />
          ))}
        </div>
      )}
    </button>
  );
}
