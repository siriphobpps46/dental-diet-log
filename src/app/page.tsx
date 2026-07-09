"use client";

import { useCallback, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { EntryFormModal } from "@/components/EntryFormModal";
import { ErrorCard } from "@/components/ErrorCard";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { EntryListSkeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { ToothMascot } from "@/components/ToothMascot";
import { fetchEntriesByDate } from "@/lib/api";
import { formatThaiDate, todayDateStr } from "@/lib/date";
import { useToast } from "@/lib/useToast";
import type { Entry } from "@/lib/types";

type ModalState = { mode: "add" } | { mode: "edit"; entry: Entry } | null;

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const { toast, notify } = useToast();
  const today = todayDateStr();

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await fetchEntriesByDate(today);
      data.sort((a, b) => a.time.localeCompare(b.time));
      setEntries(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err : new Error("โหลดข้อมูลไม่สำเร็จ"));
    }
  }, [today]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await fetchEntriesByDate(today);
        data.sort((a, b) => a.time.localeCompare(b.time));
        if (!ignore) setEntries(data);
      } catch (err) {
        if (!ignore) setLoadError(err instanceof Error ? err : new Error("โหลดข้อมูลไม่สำเร็จ"));
      }
    })();
    return () => {
      ignore = true;
    };
  }, [today]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-lg px-5 pt-8">
        <div className="flex items-center gap-3">
          <ToothMascot pose="wave" className="h-14 w-14 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-purple-900">Dental Diet Log</h1>
            <p className="text-sm text-purple-400">{formatThaiDate(today)}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-3 px-5 pb-24 pt-6">
        {entries === null && !loadError && <EntryListSkeleton />}
        {loadError && <ErrorCard error={loadError} onRetry={load} />}
        {entries !== null && !loadError && entries.length === 0 && (
          <EmptyState
            pose="sleepy"
            title="ยังไม่ได้ลงมื้ออาหารวันนี้เลย"
            subtitle="กดปุ่ม + เพื่อเริ่มบันทึกมื้อแรกของวันนี้กันนะ"
          />
        )}
        {entries !== null &&
          !loadError &&
          entries.length > 0 &&
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => setModalState({ mode: "edit", entry })} />
          ))}
      </main>

      <FloatingAddButton onClick={() => setModalState({ mode: "add" })} />
      <BottomNav />
      <Toast toast={toast} />

      {modalState && (
        <EntryFormModal
          key={modalState.mode === "edit" ? modalState.entry.id : "add"}
          mode={modalState.mode}
          entry={modalState.mode === "edit" ? modalState.entry : undefined}
          defaultDate={today}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            notify("บันทึกแล้ว เก่งมาก 💜");
            load();
          }}
          onDeleted={() => {
            setModalState(null);
            notify("ลบแล้วนะ");
            load();
          }}
        />
      )}
    </div>
  );
}
