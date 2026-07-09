import type { Entry, EntryInput } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

export class ApiConfigError extends Error {
  constructor() {
    super("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_APPS_SCRIPT_URL");
    this.name = "ApiConfigError";
  }
}

function requireBaseUrl(): string {
  if (!BASE_URL) throw new ApiConfigError();
  return BASE_URL;
}

async function get(params: Record<string, string>): Promise<{ entries: Entry[] }> {
  const url = new URL(requireBaseUrl());
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
  return data;
}

async function post(action: "create" | "update" | "delete", entry: Partial<EntryInput> & { id?: string }) {
  const res = await fetch(requireBaseUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, entry }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "บันทึกข้อมูลไม่สำเร็จ");
  return data;
}

export async function fetchEntriesByDate(date: string): Promise<Entry[]> {
  const { entries } = await get({ date });
  return entries;
}

export async function fetchEntriesByRange(from: string, to: string): Promise<Entry[]> {
  const { entries } = await get({ from, to });
  return entries;
}

export async function createEntry(input: EntryInput): Promise<Entry> {
  const { entry } = await post("create", input);
  return entry;
}

export async function updateEntry(input: EntryInput): Promise<Entry> {
  const { entry } = await post("update", input);
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  await post("delete", { id });
}

// Chrome's Opaque Response Blocking rejects hotlinked drive.google.com URLs
// in <img> tags (Drive doesn't send CORS/CORP headers), and Apps Script Web
// Apps can't return a raw Blob from doGet either. So photos are fetched as
// base64 JSON through the Apps Script and rendered as data: URLs instead.
export async function fetchPhotoDataUrl(driveUrl: string): Promise<string> {
  const fileId = driveUrl.match(/[?&]id=([^&]+)/)?.[1];
  if (!fileId) throw new Error("ลิงก์รูปไม่ถูกต้อง");

  const url = new URL(requireBaseUrl());
  url.searchParams.set("photo", fileId);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "โหลดรูปไม่สำเร็จ");
  return `data:${data.mimeType};base64,${data.base64}`;
}
