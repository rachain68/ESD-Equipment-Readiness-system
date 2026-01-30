const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Equipment = require('./Equipment');
const User = require('./User');

const TestRecord = sequelize.define('TestRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Equipment,
      key: 'id'
    }
  },
  test_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  serial_number: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  calibration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  // CAL Test Results
  cal_test: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  cal_first_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  cal_second_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // Golden Unit Conductive Test Results
  golden_conductive_test: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  golden_conductive_first_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  golden_conductive_second_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // Golden Unit Insulative Test Results
  golden_insulative_test: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  golden_insulative_first_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  golden_insulative_second_retest: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // Test Location and Operator
  test_location: {
    type: DataTypes.ENUM('CAL Lab', 'Field'),
    defaultValue: 'CAL Lab'
  },
  test_status: {
    type: DataTypes.ENUM('pass', 'fail', 'pending'),
    defaultValue: 'pending'
  },
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'test_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TestRecord;
