const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Equipment = require('./Equipment');
const User = require('./User');

const DailyCheckReport = sequelize.define('DailyCheckReport', {
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
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pass', 'fail', 'pending'),
    defaultValue: 'pending'
  },
  min_resistance: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  max_resistance: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  avg_resistance: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  test_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pass_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fail_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'daily_check_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['equipment_id', 'test_date']
    }
  ]
});

module.exports = DailyCheckReport;
