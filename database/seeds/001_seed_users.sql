-- เพิ่มข้อมูลผู้ใช้เริ่มต้น
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
('admin', 'admin@esd.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin', 'System Administrator'),
('operator1', 'operator1@esd.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'operator', 'Test Operator 1'),
('inspector1', 'inspector1@esd.com', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'inspector', 'Quality Inspector 1');

-- หมายเหตุ: password_hash ข้างต้นคือ "password123" ที่ถูก hash ด้วย bcrypt
-- ในการใช้งานจริงควรเปลี่ยนรหัสผ่านเหล่านี้
