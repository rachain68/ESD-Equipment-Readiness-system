const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Equipment = require('./Equipment');
const User = require('./User');

const ByOffReport = sequelize.define('ByOffReport', {
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
  test_points: {
    type: DataTypes.JSON,
    allowNull: true
  },
  results: {
    type: DataTypes.JSON,
    allowNull: true
  },
  calibration_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  performance_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  safety_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  overall_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'by_off_reports',
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

module.exports = ByOffReport;
