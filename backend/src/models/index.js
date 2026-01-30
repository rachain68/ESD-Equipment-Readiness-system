const { sequelize } = require('../utils/database');
const User = require('./User');
const Equipment = require('./Equipment');
const TestRecord = require('./TestRecord');
const DailyCheckReport = require('./DailyCheckReport');
const ByOffReport = require('./ByOffReport');
const IQAReport = require('./IQAReport');

// กำหนดความสัมพันธ์ระหว่าง models
// Equipment และ TestRecord (One-to-Many)
Equipment.hasMany(TestRecord, {
  foreignKey: 'equipment_id',
  as: 'testRecords'
});
TestRecord.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// User และ TestRecord (One-to-Many)
User.hasMany(TestRecord, {
  foreignKey: 'operator_id',
  as: 'testRecords'
});
TestRecord.belongsTo(User, {
  foreignKey: 'operator_id',
  as: 'operator'
});

// Equipment และ DailyCheckReport (One-to-Many)
Equipment.hasMany(DailyCheckReport, {
  foreignKey: 'equipment_id',
  as: 'dailyCheckReports'
});
DailyCheckReport.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// User และ DailyCheckReport (One-to-Many)
User.hasMany(DailyCheckReport, {
  foreignKey: 'operator_id',
  as: 'dailyCheckReports'
});
DailyCheckReport.belongsTo(User, {
  foreignKey: 'operator_id',
  as: 'operator'
});

// Equipment และ ByOffReport (One-to-Many)
Equipment.hasMany(ByOffReport, {
  foreignKey: 'equipment_id',
  as: 'byOffReports'
});
ByOffReport.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// User และ ByOffReport (One-to-Many)
User.hasMany(ByOffReport, {
  foreignKey: 'operator_id',
  as: 'byOffReports'
});
ByOffReport.belongsTo(User, {
  foreignKey: 'operator_id',
  as: 'operator'
});

// Equipment และ IQAReport (One-to-Many)
Equipment.hasMany(IQAReport, {
  foreignKey: 'equipment_id',
  as: 'iqaReports'
});
IQAReport.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment'
});

// User และ IQAReport (One-to-Many)
User.hasMany(IQAReport, {
  foreignKey: 'inspector_id',
  as: 'iqaReports'
});
IQAReport.belongsTo(User, {
  foreignKey: 'inspector_id',
  as: 'inspector'
});

const models = {
  User,
  Equipment,
  TestRecord,
  DailyCheckReport,
  ByOffReport,
  IQAReport,
  sequelize
};

module.exports = models;
