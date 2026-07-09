import { getSupabase } from "./supabase";
import type { Entry, EntryInput, NewPhoto } from "./types";

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
  created_at: string;
  updated_at: string;
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

export async function createEntry(input: EntryInput): Promise<Entry> {
  const supabase = getSupabase();
  const newUrls = await uploadPhotos(input.photos);

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
