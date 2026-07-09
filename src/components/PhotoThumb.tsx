"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface PhotoThumbProps {
  url: string;
  alt: string;
  className?: string;
}

export function PhotoThumb({ url, alt, className }: PhotoThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-purple-50 text-purple-300`}>
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} onError={() => setFailed(true)} />;
}
