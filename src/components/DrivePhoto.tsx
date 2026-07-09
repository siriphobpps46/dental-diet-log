"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { fetchPhotoDataUrl } from "@/lib/api";

const cache = new Map<string, string>();

interface DrivePhotoProps {
  url: string;
  alt: string;
  className?: string;
}

export function DrivePhoto({ url, alt, className }: DrivePhotoProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(() => cache.get(url) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (cache.has(url)) return;

    let ignore = false;
    fetchPhotoDataUrl(url)
      .then((resolved) => {
        if (ignore) return;
        cache.set(url, resolved);
        setDataUrl(resolved);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-purple-50 text-purple-300`}>
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  if (!dataUrl) {
    return <div className={`${className} animate-pulse bg-purple-100`} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt={alt} className={className} />;
}
