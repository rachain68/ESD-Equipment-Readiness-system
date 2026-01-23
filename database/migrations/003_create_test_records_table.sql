-- สร้างตารางบันทึกการทดสอบ
CREATE TABLE test_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    resistance_value DECIMAL(10,4) NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operator_id INT,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    notes TEXT,
    test_status ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_test_date (test_date),
    INDEX idx_operator_id (operator_id),
    INDEX idx_test_status (test_status)
);
