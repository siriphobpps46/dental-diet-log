"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toDisplayPhotoUrl } from "@/lib/api";
import { compressImage } from "@/lib/image";
import type { NewPhoto } from "@/lib/types";

interface PhotoUploaderProps {
  existingUrls: string[];
  onRemoveExisting: (url: string) => void;
  newPhotos: NewPhoto[];
  onAddPhotos: (photos: NewPhoto[]) => void;
  onRemoveNewPhoto: (index: number) => void;
}

export function PhotoUploader({
  existingUrls,
  onRemoveExisting,
  newPhotos,
  onAddPhotos,
  onRemoveNewPhoto,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    try {
      const compressed = await Promise.all(Array.from(files).map(compressImage));
      onAddPhotos(compressed);
    } finally {
      setIsCompressing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {existingUrls.map((url) => (
        <div key={url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-purple-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={toDisplayPhotoUrl(url)} alt="รูปอาหาร" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemoveExisting(url)}
            aria-label="ลบรูป"
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      {newPhotos.map((photo, index) => (
        <div key={index} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-purple-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${photo.mimeType};base64,${photo.base64}`}
            alt="รูปอาหาร"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemoveNewPhoto(index)}
            aria-label="ลบรูป"
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isCompressing}
        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-purple-200 text-purple-400 transition hover:border-purple-300 hover:text-purple-500 disabled:opacity-60"
      >
        {isCompressing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        <span className="text-[11px]">{isCompressing ? "กำลังย่อ..." : "เพิ่มรูป"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
