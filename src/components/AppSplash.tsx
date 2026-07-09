"use client";

import { useEffect, useState } from "react";
import { ToothMascot } from "./ToothMascot";

const VISIBLE_MS = 800;

export function AppSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-violet-50 to-purple-100">
      <ToothMascot pose="smile" className="h-24 w-24 animate-[tooth-wiggle_0.9s_ease-in-out_infinite]" />
      <h1 className="text-lg font-bold text-purple-900">Dental Diet Log</h1>
      <p className="text-xs font-medium text-purple-400">บันทึกไดเอทประจำวันสำหรับการรักษาทันตกรรม</p>
    </div>
  );
}
