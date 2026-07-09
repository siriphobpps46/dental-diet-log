# Dental Diet Log 🦷💜

เว็บแอปบันทึกไดเอทประจำวัน (มื้ออาหาร + น้ำ + รูปภาพ) สำหรับใช้ประกอบการรักษาทันตกรรม ใช้งานง่ายจากมือถือ ไม่มี backend เต็มรูปแบบ — เก็บข้อมูลใน Google Sheet ผ่าน Google Apps Script

## โครงสร้างโปรเจกต์

- `src/` — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- `apps-script/Code.gs` — Google Apps Script backend (Web App), ดูวิธี deploy ที่ [`apps-script/README.md`](./apps-script/README.md)

## เริ่มต้นใช้งาน (local)

1. Deploy Apps Script backend ตาม [`apps-script/README.md`](./apps-script/README.md) แล้วคัดลอก Web App URL
2. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ URL:
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

## Deploy ขึ้น Vercel

```bash
npx vercel
```

ตั้งค่า Environment Variable `NEXT_PUBLIC_APPS_SCRIPT_URL` ใน Vercel Project Settings (หรือตอนรัน `vercel` ครั้งแรกก็ได้) ให้เป็น Web App URL เดียวกับที่ใช้ใน `.env.local`
