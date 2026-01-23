# การติดตั้ง MySQL สำหรับ ESD Equipment System

## วิธีที่ 1: ติดตั้ง XAMPP (แนะนำ)

### ขั้นตอนการติดตั้ง:
1. **ดาวน์โหลด XAMPP**: https://www.apachefriends.org/download.html
2. **เลือกเวอร์ชัน**: XAMPP for Windows (เวอร์ชันล่าสุด)
3. **รัน installer**: ติดตั้งตามปกติ (เลือก Apache + MySQL)
4. **เปิด XAMPP Control Panel**

### เริ่มต้น MySQL:
1. เปิด XAMPP Control Panel
2. คลิก "Start" ที่แถว MySQL
3. รอจนกลับเป็นสีเขียว

### ตั้งค่ารหัสผ่าน:
1. คลิก "Admin" ที่แถว MySQL
2. เข้า phpMyAdmin
3. ไปที่ User accounts
4. แก้ไข user "root" ตั้งรหัสผ่านเป็น `1234`

## วิธีที่ 2: ใช้ MySQL แยก

### ติดตั้ง MySQL Server:
1. ดาวน์โหลด: https://dev.mysql.com/downloads/mysql/
2. ติดตั้ง MySQL Server
3. ตั้งรหัสผ่าน root เป็น `1234`

### เริ่มต้น Service:
```cmd
net start mysql80
```

## หลังติดตั้งเสร็จ:

### 1. รันสคริปต์ตั้งค่า:
```bash
cd backend
node setup-database.js
```

### 2. รัน Backend:
```bash
npm run dev
```

### 3. รัน Frontend:
```bash
cd ../frontend
npm run dev
```

## ตรวจสอบการติดตั้ง:
- MySQL ทำงานที่ port 3306
- Database: esd_equipment_db
- User: root
- Password: 1234

## หากยังมีปัญหา:
1. ตรวจสอบว่า port 3306 ไม่ถูกใช้งาน
2. ปิด firewall ชั่วคราว
3. รีสตาร์ทเครื่องหลังติดตั้ง MySQL
