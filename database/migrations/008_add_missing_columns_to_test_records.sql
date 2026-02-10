-- เพิ่มคอลัมน์ test_status, test_type, notes ที่ขาดหายจากตาราง test_records
-- หมายเหตุ: sequelize.sync({ alter: true }) จะจัดการให้อัตโนมัติ
-- แต่เก็บ migration นี้ไว้เพื่อให้ครบถ้วน

-- เพิ่ม test_status (ถ้ายังไม่มี)
ALTER TABLE test_records
ADD COLUMN IF NOT EXISTS test_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending';

-- เพิ่ม test_type (ถ้ายังไม่มี)
ALTER TABLE test_records
ADD COLUMN IF NOT EXISTS test_type VARCHAR(50) DEFAULT 'daily_check';

-- เพิ่ม notes (ถ้ายังไม่มี)
ALTER TABLE test_records
ADD COLUMN IF NOT EXISTS notes TEXT NULL;
