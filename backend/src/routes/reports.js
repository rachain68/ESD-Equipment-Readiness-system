const express = require('express');
const router = express.Router();
const { 
  DailyCheckReport, 
  ByOffReport, 
  IQAReport, 
  Equipment, 
  User, 
  TestRecord 
} = require('../models');
const { Op } = require('sequelize');

// GET /api/reports/daily - ดูรายงานตรวจสอบประจำวัน
router.get('/daily', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      equipment_id, 
      status, 
      start_date, 
      end_date 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (equipment_id) whereClause.equipment_id = equipment_id;
    if (status) whereClause.status = status;
    
    if (start_date || end_date) {
      whereClause.test_date = {};
      if (start_date) whereClause.test_date[Op.gte] = new Date(start_date);
      if (end_date) whereClause.test_date[Op.lte] = new Date(end_date);
    }

    const { count, rows: reports } = await DailyCheckReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['test_date', 'DESC']]
    });

    res.json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports/daily - สร้างรายงานตรวจสอบประจำวัน
router.post('/daily', async (req, res) => {
  try {
    const { equipment_id, test_date, notes } = req.body;

    // ตรวจสอบว่ามีรายงานนี้อยู่แล้วหรือไม่
    const existingReport = await DailyCheckReport.findOne({
      where: { equipment_id, test_date }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'มีรายงานสำหรับอุปกรณ์นี้ในวันที่ระบุแล้ว' });
    }

    // ดึงข้อมูลการทดสอบในวันที่ระบุ
    const testRecords = await TestRecord.findAll({
      where: {
        equipment_id,
        test_date: {
          [Op.gte]: new Date(test_date + ' 00:00:00'),
          [Op.lte]: new Date(test_date + ' 23:59:59')
        }
      }
    });

    // คำนวณสถิติ
    const testCount = testRecords.length;
    const passCount = testRecords.filter(t => t.test_status === 'pass').length;
    const failCount = testRecords.filter(t => t.test_status === 'fail').length;
    
    let minResistance = null;
    let maxResistance = null;
    let avgResistance = null;

    if (testCount > 0) {
      const resistances = testRecords.map(t => parseFloat(t.resistance_value));
      minResistance = Math.min(...resistances);
      maxResistance = Math.max(...resistances);
      avgResistance = resistances.reduce((a, b) => a + b, 0) / resistances.length;
    }

    // กำหนดสถานะรายงาน
    let status = 'pending';
    if (testCount > 0) {
      status = failCount > 0 ? 'fail' : 'pass';
    }

    const report = await DailyCheckReport.create({
      equipment_id,
      test_date,
      operator_id: req.user?.id || null,
      status,
      min_resistance: minResistance,
      max_resistance: maxResistance,
      avg_resistance: avgResistance,
      test_count: testCount,
      pass_count: passCount,
      fail_count: failCount,
      notes
    });

    const createdReport = await DailyCheckReport.findByPk(report.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment'
        },
        {
          model: User,
          as: 'operator'
        }
      ]
    });

    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/byoff - ดูรายงาน By-off
router.get('/byoff', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      equipment_id, 
      status, 
      start_date, 
      end_date 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (equipment_id) whereClause.equipment_id = equipment_id;
    if (status) whereClause.status = status;
    
    if (start_date || end_date) {
      whereClause.test_date = {};
      if (start_date) whereClause.test_date[Op.gte] = new Date(start_date);
      if (end_date) whereClause.test_date[Op.lte] = new Date(end_date);
    }

    const { count, rows: reports } = await ByOffReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['test_date', 'DESC']]
    });

    res.json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports/byoff - สร้างรายงาน By-off
router.post('/byoff', async (req, res) => {
  try {
    const {
      equipment_id,
      test_date,
      test_points,
      results,
      calibration_check,
      performance_check,
      safety_check,
      notes
    } = req.body;

    // ตรวจสอบว่ามีรายงานนี้อยู่แล้วหรือไม่
    const existingReport = await ByOffReport.findOne({
      where: { equipment_id, test_date }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'มีรายงานสำหรับอุปกรณ์นี้ในวันที่ระบุแล้ว' });
    }

    // คำนวณคะแนนรวม
    let overallScore = 0;
    let scoreCount = 0;
    
    if (calibration_check !== undefined) {
      overallScore += calibration_check ? 33.33 : 0;
      scoreCount++;
    }
    if (performance_check !== undefined) {
      overallScore += performance_check ? 33.33 : 0;
      scoreCount++;
    }
    if (safety_check !== undefined) {
      overallScore += safety_check ? 33.34 : 0;
      scoreCount++;
    }

    // กำหนดสถานะ
    const status = overallScore >= 80 ? 'pass' : 'fail';

    const report = await ByOffReport.create({
      equipment_id,
      test_date,
      operator_id: req.user?.id || null,
      status,
      test_points,
      results,
      calibration_check: calibration_check || false,
      performance_check: performance_check || false,
      safety_check: safety_check || false,
      overall_score: scoreCount > 0 ? overallScore : null,
      notes
    });

    const createdReport = await ByOffReport.findByPk(report.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment'
        },
        {
          model: User,
          as: 'operator'
        }
      ]
    });

    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/iqa - ดูรายงาน IQA
router.get('/iqa', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      equipment_id, 
      status, 
      start_date, 
      end_date 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (equipment_id) whereClause.equipment_id = equipment_id;
    if (status) whereClause.status = status;
    
    if (start_date || end_date) {
      whereClause.test_date = {};
      if (start_date) whereClause.test_date[Op.gte] = new Date(start_date);
      if (end_date) whereClause.test_date[Op.lte] = new Date(end_date);
    }

    const { count, rows: reports } = await IQAReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'inspector',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['test_date', 'DESC']]
    });

    res.json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports/iqa - สร้างรายงาน IQA
router.post('/iqa', async (req, res) => {
  try {
    const {
      equipment_id,
      test_date,
      compliance_score,
      findings,
      recommendations,
      corrective_actions,
      next_inspection_date,
      standards_compliance,
      documentation_check,
      training_check,
      procedure_check,
      notes
    } = req.body;

    // ตรวจสอบว่ามีรายงานนี้อยู่แล้วหรือไม่
    const existingReport = await IQAReport.findOne({
      where: { equipment_id, test_date }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'มีรายงานสำหรับอุปกรณ์นี้ในวันที่ระบุแล้ว' });
    }

    // กำหนดสถานะตามคะแนนความสอดคล้อง
    let status = 'pending';
    if (compliance_score !== undefined) {
      status = compliance_score >= 80 ? 'approved' : 'rejected';
    }

    const report = await IQAReport.create({
      equipment_id,
      test_date,
      inspector_id: req.user?.id || null,
      status,
      compliance_score,
      findings,
      recommendations,
      corrective_actions,
      next_inspection_date,
      standards_compliance,
      documentation_check: documentation_check || false,
      training_check: training_check || false,
      procedure_check: procedure_check || false,
      notes
    });

    const createdReport = await IQAReport.findByPk(report.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment'
        },
        {
          model: User,
          as: 'inspector'
        }
      ]
    });

    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/summary - ดูสรุปรายงานทั้งหมด
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const dateFilter = {};
    if (start_date || end_date) {
      dateFilter.test_date = {};
      if (start_date) dateFilter.test_date[Op.gte] = new Date(start_date);
      if (end_date) dateFilter.test_date[Op.lte] = new Date(end_date);
    }

    const [
      dailyStats,
      byOffStats,
      iqaStats
    ] = await Promise.all([
      DailyCheckReport.findAll({
        where: dateFilter,
        attributes: [
          [DailyCheckReport.sequelize.fn('COUNT', DailyCheckReport.sequelize.col('id')), 'total'],
          [DailyCheckReport.sequelize.fn('COUNT', DailyCheckReport.sequelize.literal('CASE WHEN status = "pass" THEN 1 END')), 'pass'],
          [DailyCheckReport.sequelize.fn('COUNT', DailyCheckReport.sequelize.literal('CASE WHEN status = "fail" THEN 1 END')), 'fail'],
          [DailyCheckReport.sequelize.fn('COUNT', DailyCheckReport.sequelize.literal('CASE WHEN status = "pending" THEN 1 END')), 'pending']
        ],
        raw: true
      }),
      ByOffReport.findAll({
        where: dateFilter,
        attributes: [
          [ByOffReport.sequelize.fn('COUNT', ByOffReport.sequelize.col('id')), 'total'],
          [ByOffReport.sequelize.fn('COUNT', ByOffReport.sequelize.literal('CASE WHEN status = "pass" THEN 1 END')), 'pass'],
          [ByOffReport.sequelize.fn('COUNT', ByOffReport.sequelize.literal('CASE WHEN status = "fail" THEN 1 END')), 'fail'],
          [ByOffReport.sequelize.fn('COUNT', ByOffReport.sequelize.literal('CASE WHEN status = "pending" THEN 1 END')), 'pending']
        ],
        raw: true
      }),
      IQAReport.findAll({
        where: dateFilter,
        attributes: [
          [IQAReport.sequelize.fn('COUNT', IQAReport.sequelize.col('id')), 'total'],
          [IQAReport.sequelize.fn('COUNT', IQAReport.sequelize.literal('CASE WHEN status = "approved" THEN 1 END')), 'approved'],
          [IQAReport.sequelize.fn('COUNT', IQAReport.sequelize.literal('CASE WHEN status = "rejected" THEN 1 END')), 'rejected'],
          [IQAReport.sequelize.fn('COUNT', IQAReport.sequelize.literal('CASE WHEN status = "pending" THEN 1 END')), 'pending']
        ],
        raw: true
      })
    ]);

    res.json({
      daily: dailyStats[0] || { total: 0, pass: 0, fail: 0, pending: 0 },
      byOff: byOffStats[0] || { total: 0, pass: 0, fail: 0, pending: 0 },
      iqa: iqaStats[0] || { total: 0, approved: 0, rejected: 0, pending: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
