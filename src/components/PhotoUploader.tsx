"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { DrivePhoto } from "./DrivePhoto";
import { PhotoLightbox } from "./PhotoLightbox";
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [compressError, setCompressError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    setCompressError(null);
    try {
      const results = await Promise.allSettled(Array.from(files).map(compressImage));
      const succeeded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const failedCount = results.length - succeeded.length;
      if (succeeded.length > 0) onAddPhotos(succeeded);
      if (failedCount > 0) {
        setCompressError(
          succeeded.length > 0
            ? `เพิ่มรูปไม่สำเร็จ ${failedCount} รูป (ไฟล์อาจเสียหรือไม่ใช่รูปภาพ)`
            : "เพิ่มรูปไม่สำเร็จ ไฟล์อาจเสียหรือไม่ใช่รูปภาพ"
        );
      }
    } finally {
      setIsCompressing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {existingUrls.map((url, i) => (
          <div key={url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-purple-100">
            <button type="button" onClick={() => setLightboxIndex(i)} className="h-full w-full">
              <DrivePhoto url={url} alt="รูปอาหาร" className="h-full w-full object-cover" />
            </button>
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
      <p className="text-[11px] text-purple-300">แตะรูปเพื่อดูขนาดใหญ่ · เลือกได้หลายรูปพร้อมกัน</p>
      {compressError && <p className="text-[11px] font-medium text-rose-500">{compressError}</p>}

      {lightboxIndex !== null && (
        <PhotoLightbox
          urls={existingUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
