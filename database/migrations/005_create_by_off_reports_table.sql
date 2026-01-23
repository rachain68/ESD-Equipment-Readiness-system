-- สร้างตารางรายงาน By-off
CREATE TABLE by_off_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    test_date DATE NOT NULL,
    operator_id INT,
    status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    test_points JSON,
    results JSON,
    calibration_check BOOLEAN DEFAULT false,
    performance_check BOOLEAN DEFAULT false,
    safety_check BOOLEAN DEFAULT false,
    overall_score DECIMAL(5,2),
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
