# Dental Diet Log 🦷💜

เว็บแอปบันทึกไดเอทประจำวัน (มื้ออาหาร + น้ำ + รูปภาพ) สำหรับใช้ประกอบการรักษาทันตกรรม ใช้งานง่ายจากมือถือ ไม่มี backend เต็มรูปแบบ — เก็บข้อมูลใน Supabase (Postgres + Storage)

## โครงสร้างโปรเจกต์

- `src/` — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- `supabase/setup.sql` — schema + RLS policies + Storage bucket, ดูวิธี deploy ที่ [`supabase/README.md`](./supabase/README.md)
- `apps-script/` — backend เดิม (Google Sheets + Apps Script) เก็บไว้อ้างอิงเฉยๆ ไม่ได้ใช้งานแล้ว

## เริ่มต้นใช้งาน (local)

1. ตั้งค่า Supabase ตาม [`supabase/README.md`](./supabase/README.md) แล้วคัดลอก Project URL + anon key
2. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่า:
   ```bash
   cp .env.local.example .env.local
   ```
3. ติดตั้ง dependencies และรันเซิร์ฟเวอร์:
   ```bash
   npm install
   npm run dev
   ```
4. เปิด [http://localhost:3000](http://localhost:3000) — ถ้ายังไม่ตั้งค่า `.env.local` แอปจะแสดงข้อความแจ้งเตือนแทนที่จะพัง

## หน้าจอ

- `/` — วันนี้: มื้อที่ลงแล้ว + ปุ่ม + ลอยเพิ่มมื้อ
- `/history` — ประวัติย้อนหลัง แยกตามวัน แตะเพื่อแก้ไข/ลบ
- `/review` — สรุปข้อมูลทั้งหมดแบบอ่านอย่างเดียว กรองตามวันที่/ประเภทมื้อได้ สำหรับให้อาจารย์/นักศึกษาทันตแพทย์ดู (ไม่มีเมนูล่าง ไม่มีทางแก้ไข)

## Deploy

Live ที่ [dental-diet-log.vercel.app](https://dental-diet-log.vercel.app) — ต่อ auto-deploy กับ GitHub แล้ว push ขึ้น `main` deploy ให้อัตโนมัติ

Environment Variables `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ตั้งไว้ใน Vercel Project Settings (Production + Preview) แล้ว ให้เป็นค่าเดียวกับที่ใช้ใน `.env.local`
