const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Equipment = require('./Equipment');
const User = require('./User');

const IQAReport = sequelize.define('IQAReport', {
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
  inspector_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('approved', 'rejected', 'pending'),
    defaultValue: 'pending'
  },
  compliance_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  findings: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  corrective_actions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_inspection_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  standards_compliance: {
    type: DataTypes.JSON,
    allowNull: true
  },
  documentation_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  training_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  procedure_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'iqa_reports',
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

// กำหนดความสัมพันธ์
IQAReport.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
IQAReport.belongsTo(User, { foreignKey: 'inspector_id', as: 'inspector' });
Equipment.hasMany(IQAReport, { foreignKey: 'equipment_id', as: 'iqaReports' });
User.hasMany(IQAReport, { foreignKey: 'inspector_id', as: 'iqaReports' });

module.exports = IQAReport;
