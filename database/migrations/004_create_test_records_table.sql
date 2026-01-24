CREATE TABLE test_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    test_date DATE NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    calibration_date DATE,
    due_date DATE,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    
    -- CAL Test Results
    cal_test DECIMAL(10,2),
    cal_first_retest DECIMAL(10,2),
    cal_second_retest DECIMAL(10,2),
    
    -- Golden Unit Conductive Test Results
    golden_conductive_test DECIMAL(10,2),
    golden_conductive_first_retest DECIMAL(10,2),
    golden_conductive_second_retest DECIMAL(10,2),
    
    -- Golden Unit Insulative Test Results
    golden_insulative_test DECIMAL(10,2),
    golden_insulative_first_retest DECIMAL(10,2),
    golden_insulative_second_retest DECIMAL(10,2),
    
    -- Test Location and Operator
    test_location ENUM('CAL Lab', 'Field') DEFAULT 'CAL Lab',
    operator_id INT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_test_records_equipment ON test_records(equipment_id);
CREATE INDEX idx_test_records_date ON test_records(test_date);
CREATE INDEX idx_test_records_operator ON test_records(operator_id);
