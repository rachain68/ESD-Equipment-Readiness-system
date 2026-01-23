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
  resistance_value: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  test_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  test_status: {
    type: DataTypes.ENUM('pass', 'fail', 'pending'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'test_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// กำหนดความสัมพันธ์
TestRecord.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
TestRecord.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
Equipment.hasMany(TestRecord, { foreignKey: 'equipment_id', as: 'testRecords' });
User.hasMany(TestRecord, { foreignKey: 'operator_id', as: 'testRecords' });

module.exports = TestRecord;
