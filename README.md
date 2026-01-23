# ESD Equipment Readiness System

ระบบทดสอบเครื่องวัดค่าความต้านทาน (Resistance Meter Testing System)

## ภาพรวมโปรเจ็ค

ระบบนี้พัฒนาขึ้นเพื่อใช้ในการทดสอบและบันทึกข้อมูลเครื่องวัดค่าความต้านทาน โดยมีความสามารถในการสร้างรายงานได้ 3 ประเภท:
1. **Daily Check Report** - รายงานตรวจสอบประจำวัน
2. **By-Off Report** - รายงานตรวจสอบแบบ By-off
3. **IQA Report** - รายงานตรวจสอบคุณภาพภายใน (Internal Quality Assurance)

## เทคโนโลยีที่ใช้

### Frontend
- **React 18+** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - CSS Framework
- **React Router** - Routing
- **React Query** - State Management
- **Socket.IO Client** - Real-time Communication

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Sequelize** - ORM
- **MySQL/MariaDB** - Database
- **Socket.IO** - Real-time Communication
- **JWT** - Authentication

## โครงสร้างโปรเจ็ค

```
ESD Equipment Readiness system/
├── backend/                 # แบ็คเอนด์ Node.js
│   ├── src/
│   │   ├── controllers/     # Controllers
│   │   ├── models/         # Database Models
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Middleware
│   │   └── utils/          # Utilities
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── frontend/               # ฟรอนต์เอนด์ React
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/          # Page Components
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API Services
│   │   └── main.jsx        # Entry Point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── database/               # ฐานข้อมูล
│   ├── migrations/        # Migration Files
│   └── seeds/             # Seed Data
├── docs/                  # เอกสาร
├── README.md
└── MIGRATION_PLAN.md      # แผนการพัฒนา
```

## การติดตั้งและการตั้งค่า

### ข้อกำหนดเบื้องต้น
- Node.js 18+
- MySQL/MariaDB
- Git

### การติดตั้ง

1. **โคลนโปรเจ็ค**
```bash
git clone <repository-url>
cd "ESD Equipment Readiness system"
```

2. **ติดตั้งแบ็คเอนด์**
```bash
cd backend
npm install
cp .env.example .env
# แก้ไขค่าใน .env ตามความเหมาะสม
```

3. **ติดตั้งฟรอนต์เอนด์**
```bash
cd ../frontend
npm install
```

4. **ตั้งค่าฐานข้อมูล**
- สร้างฐานข้อมูลชื่อ `esd_equipment_db`
- รัน migration files จาก `database/migrations/`
- รัน seed data จาก `database/seeds/`

### การรันโปรเจ็ค

1. **เริ่มแบ็คเอนด์**
```bash
cd backend
npm run dev
```

2. **เริ่มฟรอนต์เอนด์**
```bash
cd frontend
npm run dev
```

3. **เข้าใช้งาน**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## ฟีเจอร์หลัก

### 1. การจัดการอุปกรณ์
- ลงทะเบียนอุปกรณ์วัดความต้านทาน
- ติดตามสถานะการสอบเทียบ
- จัดการข้อมูลอุปกรณ์

### 2. การทดสอบแบบเรียลไทม์
- แสดงค่าความต้านทานแบบสด
- บันทึกข้อมูลการทดสอบอัตโนมัติ
- การแจ้งเตือนเมื่อค่าอยู่นอกช่วงที่กำหนด

### 3. ระบบรายงาน
- **Daily Check**: รายงานตรวจสอบประจำวัน
- **By-Off**: รายงานตรวจสอบแบบ By-off
- **IQA**: รายงานตรวจสอบคุณภาพภายใน
- ส่งออกรายงานเป็น PDF/Excel

### 4. การจัดการผู้ใช้
- ระบบสิทธิ์ผู้ใช้ (Admin, Operator, Inspector)
- การตรวจสอบสิทธิ์ JWT
- การจัดการบทบาท

## API Endpoints

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/logout` - ออกจากระบบ

### Equipment
- `GET /api/equipment` - ดูรายการอุปกรณ์
- `POST /api/equipment` - เพิ่มอุปกรณ์
- `PUT /api/equipment/:id` - แก้ไขอุปกรณ์
- `DELETE /api/equipment/:id` - ลบอุปกรณ์

### Tests
- `GET /api/tests` - ดูประวัติการทดสอบ
- `POST /api/tests` - บันทึกการทดสอบ
- `GET /api/tests/:id` - ดูรายละเอียดการทดสอบ

### Reports
- `GET /api/reports/daily` - รายงานประจำวัน
- `GET /api/reports/byoff` - รายงาน By-off
- `GET /api/reports/iqa` - รายงาน IQA
- `POST /api/reports/generate` - สร้างรายงาน

## การพัฒนาต่อ

### การเพิ่มฟีเจอร์ใหม่
1. สร้าง branch ใหม่
2. พัฒนาฟีเจอร์
3. ทดสอบ
4. สร้าง Pull Request

### การทดสอบ
```bash
# ทดสอบแบ็คเอนด์
cd backend
npm test

# ทดสอบฟรอนต์เอนด์
cd frontend
npm test
```

## การปรับใช้งาน (Deployment)

### การปรับใช้แบ็คเอนด์
1. ตั้งค่า environment variables
2. Build โปรเจ็ค
3. รัน migration
4. เริ่ม server

### การปรับใช้ฟรอนต์เอนด์
1. Build โปรเจ็ค
2. อัปโหลดไปยัง web server
3. ตั้งค่า reverse proxy

## การสนับสนุน

หากพบปัญหาหรือมีข้อสงสัย กรุณาติดต่อ:
- Email: support@esd.com
- Documentation: ดูในโฟลเดอร์ `docs/`

## License

MIT License - ดูรายละเอียดในไฟล์ LICENSE
