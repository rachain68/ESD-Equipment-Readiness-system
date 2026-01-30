-- สร้างตารางรายงานตรวจสอบประจำวัน
CREATE TABLE daily_check_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    test_date DATE NOT NULL,
    operator_id INT,
    status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    min_resistance DECIMAL(10,4),
    max_resistance DECIMAL(10,4),
    avg_resistance DECIMAL(10,4),
    test_count INT DEFAULT 0,
    pass_count INT DEFAULT 0,
    fail_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_equipment_date (equipment_id, test_date),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_test_date (test_date),
    INDEX idx_operator_id (operator_id),
    INDEX idx_status (status)
);
