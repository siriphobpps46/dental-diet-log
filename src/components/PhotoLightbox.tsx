"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DrivePhoto } from "./DrivePhoto";

interface PhotoLightboxProps {
  urls: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PhotoLightbox({ urls, index, onClose, onIndexChange }: PhotoLightboxProps) {
  const hasMultiple = urls.length > 1;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + urls.length) % urls.length);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % urls.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, urls.length, onClose, onIndexChange]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Rendered via a portal straight into <body>: a CSS transform on any
  // ancestor (e.g. EntryCard's active:scale-[0.99] press effect) would
  // otherwise create a new containing block for this fixed-position overlay,
  // making it position itself relative to that ancestor instead of the
  // viewport — which is exactly the "works from the form, weird from the
  // card" bug, since only the card has a transform in its interactive states.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      onClick={(e) => {
        // Always stop here so a tap anywhere in the lightbox (close button,
        // arrows, backdrop) never bubbles to whatever card opened it.
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดรูปขยาย"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={() => onIndexChange((index - 1 + urls.length) % urls.length)}
          aria-label="รูปก่อนหน้า"
          className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <DrivePhoto
        url={urls[index]}
        alt="รูปอาหาร"
        className="min-h-[200px] min-w-[200px] max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
      />

      {hasMultiple && (
        <button
          type="button"
          onClick={() => onIndexChange((index + 1) % urls.length)}
          aria-label="รูปถัดไป"
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {hasMultiple && (
        <div className="absolute bottom-5 flex gap-1.5">
          {urls.map((url, i) => (
            <span key={url} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
