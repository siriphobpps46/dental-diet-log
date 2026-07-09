#!/usr/bin/env node
// One-off migration: existing Google Sheets/Apps Script data -> Supabase.
// Run once, after supabase/setup.sql has been applied to the new project.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/migrate-to-supabase.mjs

import { createClient } from "@supabase/supabase-js";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyPbnfHHpziQMuzap0x0B4gyohD0vGiEh9Cerb_udOql2ap5KkXuLFwBU-2RQLs_w/exec";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_ANON_KEY env vars first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchAllEntries() {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("from", "0000-01-01");
  url.searchParams.set("to", "9999-12-31");
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to fetch entries");
  return data.entries;
}

async function fetchPhotoBytes(driveUrl) {
  const fileId = driveUrl.match(/[?&]id=([^&]+)/)?.[1];
  if (!fileId) throw new Error(`Could not extract file id from ${driveUrl}`);
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("photo", fileId);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || `Failed to fetch photo ${fileId}`);
  return { bytes: Buffer.from(data.base64, "base64"), mimeType: data.mimeType };
}

async function migratePhoto(driveUrl) {
  const { bytes, mimeType } = await fetchPhotoBytes(driveUrl);
  const ext = mimeType === "image/png" ? "png" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, bytes, { contentType: mimeType });
  if (error) throw new Error(error.message);
  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(path);
  return publicUrl;
}

async function main() {
  console.log("Fetching entries from Apps Script...");
  const entries = await fetchAllEntries();
  console.log(`Found ${entries.length} entries.`);

  let migratedPhotos = 0;
  let failed = 0;

  for (const entry of entries) {
    const newPhotoUrls = [];
    for (const driveUrl of entry.photoUrls) {
      try {
        newPhotoUrls.push(await migratePhoto(driveUrl));
        migratedPhotos++;
        process.stdout.write(".");
      } catch (err) {
        console.error(`\nFailed to migrate photo for entry ${entry.id}: ${err.message}`);
        failed++;
      }
    }

    const { error } = await supabase.from("entries").insert({
      date: entry.date,
      time: entry.time,
      meal_type: entry.mealType,
      description: entry.description,
      water: entry.water,
      note: entry.note,
      photo_urls: newPhotoUrls,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    });
    if (error) {
      console.error(`\nFailed to insert entry ${entry.id}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n\nDone. ${entries.length} entries processed, ${migratedPhotos} photos migrated, ${failed} failures.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
