const { sequelize } = require('../utils/database');
const User = require('./User');
const Equipment = require('./Equipment');
const TestRecord = require('./TestRecord');
const DailyCheckReport = require('./DailyCheckReport');
const ByOffReport = require('./ByOffReport');
const IQAReport = require('./IQAReport');

// กำหนดความสัมพันธ์เพิ่มเติมถ้าจำเป็น
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
