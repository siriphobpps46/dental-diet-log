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
  // dataUrl is always derived fresh from the cache + a url-tagged fetch result,
  // never stored as plain state — a component instance can be reused across
  // different (already-cached) urls, e.g. paging through the photo lightbox,
  // and stale state wouldn't pick up the new url's cached value.
  const [fetched, setFetched] = useState<{ url: string; dataUrl: string } | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(url)) return;

    let ignore = false;
    fetchPhotoDataUrl(url)
      .then((resolved) => {
        if (ignore) return;
        cache.set(url, resolved);
        setFetched({ url, dataUrl: resolved });
      })
      .catch(() => {
        if (!ignore) setFailedUrl(url);
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  const dataUrl = cache.get(url) ?? (fetched?.url === url ? fetched.dataUrl : null);

  if (!dataUrl && failedUrl === url) {
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
