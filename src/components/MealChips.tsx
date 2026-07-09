"use client";

import { useState } from "react";
import { MEAL_PRESETS } from "@/lib/types";

interface MealChipsProps {
  value: string;
  onChange: (value: string) => void;
}

export function MealChips({ value, onChange }: MealChipsProps) {
  const isPreset = (MEAL_PRESETS as readonly string[]).includes(value);
  const [customMode, setCustomMode] = useState(value !== "" && !isPreset);
  const [customText, setCustomText] = useState(customMode ? value : "");

  return (
    <div className="flex flex-wrap gap-2">
      {MEAL_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => {
            setCustomMode(false);
            onChange(preset);
          }}
          className={chipClass(!customMode && value === preset)}
        >
          {preset}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          setCustomMode(true);
          onChange(customText);
        }}
        className={chipClass(customMode)}
      >
        + เพิ่มมื้อเอง
      </button>
      {customMode && (
        <input
          autoFocus
          value={customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="เช่น มื้อดึก, ของหวานหลังเลิกงาน"
          className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-purple-900 placeholder:text-purple-300 focus:border-purple-400 focus:outline-none"
        />
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    active
      ? "bg-purple-500 text-white shadow-sm shadow-purple-300"
      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
  }`;
}
