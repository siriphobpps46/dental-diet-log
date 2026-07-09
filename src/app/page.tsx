"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Eye } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { EntryFormModal } from "@/components/EntryFormModal";
import { ErrorCard } from "@/components/ErrorCard";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { LoadingTooth } from "@/components/LoadingTooth";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Toast } from "@/components/Toast";
import { ToothMascot } from "@/components/ToothMascot";
import { fetchEntriesByDate } from "@/lib/api";
import { formatThaiDate, todayDateStr } from "@/lib/date";
import { useToast } from "@/lib/useToast";
import type { Entry } from "@/lib/types";

type ModalState = { mode: "add" } | { mode: "edit"; entry: Entry } | null;

export default function HomePage() {
  const [modalState, setModalState] = useState<ModalState>(null);
  const { toast, notify } = useToast();
  const today = todayDateStr();

  const { data, error, mutate } = useSWR<Entry[]>(
    ["entries", "date", today],
    async () => {
      const data = await fetchEntriesByDate(today);
      data.sort((a, b) => b.time.localeCompare(a.time));
      return data;
    }
  );

  const entries = data ?? null;
  const loadError = error ?? null;
  const load = () => mutate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-lg px-5 pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ToothMascot pose="wave" className="h-14 w-14 shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-purple-900">Dental Diet Log</h1>
              <p className="text-sm text-purple-400">{formatThaiDate(today)}</p>
            </div>
          </div>
          <Link
            href="/review"
            aria-label="ดูข้อมูลทั้งหมด"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-purple-400 shadow-sm shadow-purple-100 ring-1 ring-purple-50 hover:text-purple-600"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-24 pt-6">
        <PullToRefresh onRefresh={load} disabled={modalState !== null}>
          <div className="flex flex-col gap-3">
            {entries === null && !loadError && <LoadingTooth />}
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
          </div>
        </PullToRefresh>
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
