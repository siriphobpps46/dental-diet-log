"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => void | Promise<unknown>;
  disabled?: boolean;
  children: React.ReactNode;
}

const THRESHOLD = 70;
const MAX_PULL = 100;

export function PullToRefresh({ onRefresh, disabled = false, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    if (disabled) return;

    function handleTouchStart(e: TouchEvent) {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) return;
      e.preventDefault();
      setDragging(true);
      const next = Math.min(delta * 0.5, MAX_PULL);
      pullRef.current = next;
      setPull(next);
    }

    async function handleTouchEnd() {
      if (startY.current === null) return;
      startY.current = null;
      setDragging(false);
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        await onRefresh();
        setRefreshing(false);
      }
      pullRef.current = 0;
      setPull(0);
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, onRefresh, refreshing]);

  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center"
        style={{
          height: MAX_PULL,
          opacity: pull > 0 || refreshing ? progress : 0,
          transform: `translateY(${pull - MAX_PULL}px)`,
          transition: dragging ? "none" : "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <RefreshCw
          className={`mt-4 h-6 w-6 text-purple-400 ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
