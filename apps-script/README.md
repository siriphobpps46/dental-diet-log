# Apps Script Backend — วิธี Deploy

ขั้นตอนนี้ต้องทำเองผ่าน Google account ของคุณ (ผมช่วยแบบอัตโนมัติไม่ได้เพราะต้อง login):

1. สร้าง Google Sheet ใหม่ (ตั้งชื่ออะไรก็ได้ เช่น "Dental Diet Log Data")
2. ในชีท ไปที่ **Extensions → Apps Script**
3. ลบโค้ด default ทั้งหมดใน `Code.gs` แล้ววางโค้ดจากไฟล์ [`Code.gs`](./Code.gs) ในโฟลเดอร์นี้แทน
4. กด **Save** (ไอคอนแผ่นดิสก์ หรือ Ctrl/Cmd+S)
5. กด **Deploy → New deployment**
   - Type: เลือก **Web app** (ไอคอนรูปเฟือง → เลือก "Web app")
   - Description: อะไรก็ได้ เช่น "v1"
   - **Execute as: Me** (บัญชีของคุณ)
   - **Who has access: Anyone**
6. กด **Deploy** → จะขอ authorize สิทธิ์ (Sheet + Drive) → กด **Allow**
7. คัดลอก **Web app URL** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/XXXXXXXX/exec`)
   - นี่คือค่าที่ต้องใส่ใน `NEXT_PUBLIC_APPS_SCRIPT_URL` ของฝั่ง Next.js
8. ทดสอบด้วย curl:
   ```bash
   # ทดสอบอ่านข้อมูล (ควรได้ {"ok":true,"entries":[]})
   curl "https://script.google.com/macros/s/XXXXXXXX/exec?date=2026-07-09"

   # ทดสอบสร้าง entry (ไม่มีรูป)
   curl -X POST "https://script.google.com/macros/s/XXXXXXXX/exec" \
     -H "Content-Type: text/plain" \
     -d '{"action":"create","entry":{"date":"2026-07-09","time":"08:00","mealType":"เช้า","description":"ข้าวต้ม","water":"1 แก้ว","photos":[],"note":""}}'
   ```
   - เช็คว่าแถวใหม่ขึ้นใน Sheet "Entries" (ชีทนี้จะถูกสร้างอัตโนมัติในครั้งแรกที่เรียก)

**หมายเหตุ**: ถ้าแก้โค้ด `Code.gs` ในภายหลัง ต้องกด **Deploy → Manage deployments → แก้ไข (ไอคอนดินสอ) → New version → Deploy** ใหม่ทุกครั้ง ไม่งั้น Web App URL จะยังรันโค้ดเวอร์ชันเก่าอยู่ (URL เดิมใช้ได้ ไม่ต้องเปลี่ยน env var)

โฟลเดอร์รูปภาพใน Google Drive ("Dental Diet Log Photos") จะถูกสร้างอัตโนมัติในการอัปโหลดรูปครั้งแรก
