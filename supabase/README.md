# Supabase Backend — วิธี Deploy

ขั้นตอนนี้ต้องทำเองผ่านบัญชี Supabase ของคุณ (ผมช่วยแบบอัตโนมัติไม่ได้เพราะต้อง login):

1. ไปที่ [supabase.com](https://supabase.com) → สร้างบัญชี (ฟรี ใช้ GitHub login ได้) → **New project**
   - ตั้งชื่อ, เลือก region ที่ใกล้ (เช่น Singapore), ตั้ง database password (เก็บไว้เผื่อใช้)
   - รอสักครู่ให้ project provision เสร็จ (~2 นาที)
2. ไปที่ **SQL Editor** (เมนูซ้าย) → **New query** → คัดลอกเนื้อหาทั้งหมดจาก [`setup.sql`](./setup.sql) ในโฟลเดอร์นี้ → วาง → กด **Run**
   - จะสร้างตาราง `entries`, เปิด Row Level Security, และสร้าง Storage bucket `photos` ให้อัตโนมัติ
3. ไปที่ **Project Settings → API** → คัดลอก 2 ค่านี้:
   - **Project URL** → ใช้เป็น `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (ไม่ใช่ `service_role`) → ใช้เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. ส่งค่าทั้งสองนี้กลับมา ผมจะช่วยตั้งค่าและทดสอบต่อให้ครับ

**หมายเหตุความปลอดภัย**: `anon` key ตั้งใจให้ฝังในโค้ดฝั่ง client ได้ (เหมือน API key สาธารณะ) — ความปลอดภัยจริงๆ มาจาก RLS policy ที่ตั้งไว้ใน `setup.sql` ไม่ใช่การซ่อนคีย์ อย่าใช้ `service_role` key ในฝั่ง client เด็ดขาด (คีย์นั้นข้าม RLS ได้ทั้งหมด)
