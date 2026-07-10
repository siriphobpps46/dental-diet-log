export const MEAL_PRESETS = ["เช้า", "กลางวัน", "เย็น", "ของว่าง"] as const;

export type MealPreset = (typeof MEAL_PRESETS)[number];

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: string;
  description: string;
  water: string;
  photoUrls: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
  aiRiskLevel?: string;
  aiAnalysis?: {
    riskLevel: "high" | "medium" | "low";
    foodItems: string[];
    dentalAnalysis: string;
    recommendation: string;
  } | null;
}

export interface NewPhoto {
  blob: Blob;
  mimeType: string;
  name: string;
}

export interface EntryInput {
  id?: string;
  date: string;
  time: string;
  mealType: string;
  description: string;
  water: string;
  photos: NewPhoto[];
  existingPhotoUrls?: string[];
  note: string;
}

export interface Profile {
  name: string;
  gender: string;
  birthDate: string; // YYYY-MM-DD, "" if not set
}
