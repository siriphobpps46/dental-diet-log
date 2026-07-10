import { getSupabase } from "./supabase";
import type { Entry, EntryInput, NewPhoto, Profile } from "./types";

const PHOTOS_BUCKET = "photos";

interface EntryRow {
  id: string;
  date: string;
  time: string;
  meal_type: string;
  description: string;
  water: string;
  note: string;
  photo_urls: string[] | null;
  ai_risk_level: string | null;
  ai_analysis: any | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  name: string;
  gender: string;
  birth_date: string | null;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    gender: row.gender,
    birthDate: row.birth_date ?? "",
  };
}

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    mealType: row.meal_type,
    description: row.description,
    water: row.water,
    photoUrls: row.photo_urls ?? [],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    aiRiskLevel: row.ai_risk_level ?? "none",
    aiAnalysis: row.ai_analysis ?? null,
  };
}

async function uploadPhotos(photos: NewPhoto[]): Promise<string[]> {
  if (photos.length === 0) return [];
  const supabase = getSupabase();

  return Promise.all(
    photos.map(async (photo) => {
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, photo.blob, {
        contentType: photo.mimeType,
      });
      if (error) throw new Error(error.message);
      const {
        data: { publicUrl },
      } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
      return publicUrl;
    })
  );
}

export async function fetchEntriesByDate(date: string): Promise<Entry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("entries").select("*").eq("date", date);
  if (error) throw new Error(error.message);
  return (data as EntryRow[]).map(rowToEntry);
}

export async function fetchEntriesByRange(from: string, to: string): Promise<Entry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("entries").select("*").gte("date", from).lte("date", to);
  if (error) throw new Error(error.message);
  return (data as EntryRow[]).map(rowToEntry);
}

async function callAnalyzeApi(description: string, water: string, photoUrls: string[]) {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description, water, photoUrls }),
    });
    if (!res.ok) {
      throw new Error(`Analyze API returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error calling analyze API:", error);
    return {
      riskLevel: "low",
      foodItems: [],
      dentalAnalysis: "ไม่สามารถประมวลผลข้อมูลด้วย AI ในขณะบันทึกได้",
      recommendation: "แปรงฟันทำความสะอาดช่องปากตามปกติหลังมื้ออาหาร",
    };
  }
}

export async function createEntry(input: EntryInput): Promise<Entry> {
  const supabase = getSupabase();
  const newUrls = await uploadPhotos(input.photos);
  const aiResult = await callAnalyzeApi(input.description, input.water, newUrls);

  const { data, error } = await supabase
    .from("entries")
    .insert({
      date: input.date,
      time: input.time,
      meal_type: input.mealType,
      description: input.description,
      water: input.water,
      note: input.note,
      photo_urls: newUrls,
      ai_risk_level: aiResult.riskLevel,
      ai_analysis: aiResult,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToEntry(data as EntryRow);
}

export async function updateEntry(input: EntryInput): Promise<Entry> {
  if (!input.id) throw new Error("Missing entry id");
  const supabase = getSupabase();
  const newUrls = await uploadPhotos(input.photos);
  const photoUrls = [...(input.existingPhotoUrls ?? []), ...newUrls];
  const aiResult = await callAnalyzeApi(input.description, input.water, photoUrls);

  const { data, error } = await supabase
    .from("entries")
    .update({
      date: input.date,
      time: input.time,
      meal_type: input.mealType,
      description: input.description,
      water: input.water,
      note: input.note,
      photo_urls: photoUrls,
      ai_risk_level: aiResult.riskLevel,
      ai_analysis: aiResult,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToEntry(data as EntryRow);
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchProfile(): Promise<Profile> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("profile").select("*").eq("id", "main").single();
  if (error) throw new Error(error.message);
  return rowToProfile(data as ProfileRow);
}

export async function updateProfile(input: Profile): Promise<Profile> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profile")
    .update({
      name: input.name,
      gender: input.gender,
      birth_date: input.birthDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "main")
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToProfile(data as ProfileRow);
}
