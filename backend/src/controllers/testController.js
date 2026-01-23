const { TestRecord, Equipment, User } = require('../models');
const { Op } = require('sequelize');

// บันทึกข้อมูลการทดสอบ
const createTestRecord = async (req, res) => {
  try {
    const {
      equipment_id,
      resistance_value,
      temperature,
      humidity,
      notes,
      test_status = 'pending'
    } = req.body;

    // ตรวจสอบว่ามีอุปกรณ์นี้อยู่จริง
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    }

    const testRecord = await TestRecord.create({
      equipment_id,
      resistance_value,
      operator_id: req.user?.id || null,
      temperature,
      humidity,
      notes,
      test_status
    });

    // ส่งข้อมูลการทดสอบไปยัง clients ที่เชื่อมต่ออยู่ (real-time)
    // Note: Socket.io จะถูกจัดการใน middleware หรือ service แยกต่างหาก
    console.log('Test data created:', testRecord);

    res.status(201).json(testRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูประวัติการทดสอบทั้งหมด
const getAllTestRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      equipment_id, 
      test_status, 
      start_date, 
      end_date 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (equipment_id) {
      whereClause.equipment_id = equipment_id;
    }

    if (test_status) {
      whereClause.test_status = test_status;
    }

    if (start_date || end_date) {
      whereClause.test_date = {};
      if (start_date) {
        whereClause.test_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.test_date[Op.lte] = new Date(end_date);
      }
    }

    const { count, rows: testRecords } = await TestRecord.findAndCountAll({
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
      testRecords,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูรายละเอียดการทดสอบ
const getTestRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testRecord = await TestRecord.findByPk(id, {
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

    if (!testRecord) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลการทดสอบ' });
    }

    res.json(testRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// แก้ไขข้อมูลการทดสอบ
const updateTestRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await TestRecord.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลการทดสอบ' });
    }

    const updatedTestRecord = await TestRecord.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name']
        }
      ]
    });

    // ส่งข้อมูลการอัปเดตไปยัง clients
    console.log('Test data updated:', updatedTestRecord);

    res.json(updatedTestRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ลบข้อมูลการทดสอบ
const deleteTestRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await TestRecord.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลการทดสอบ' });
    }

    res.json({ message: 'ลบข้อมูลการทดสอบเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูสถิติการทดสอบ
const getTestStats = async (req, res) => {
  try {
    const { equipment_id, start_date, end_date } = req.query;
    
    const whereClause = {};
    if (equipment_id) {
      whereClause.equipment_id = equipment_id;
    }
    
    if (start_date || end_date) {
      whereClause.test_date = {};
      if (start_date) {
        whereClause.test_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.test_date[Op.lte] = new Date(end_date);
      }
    }

    const totalTests = await TestRecord.count({ where: whereClause });
    const passTests = await TestRecord.count({ 
      where: { ...whereClause, test_status: 'pass' } 
    });
    const failTests = await TestRecord.count({ 
      where: { ...whereClause, test_status: 'fail' } 
    });
    const pendingTests = await TestRecord.count({ 
      where: { ...whereClause, test_status: 'pending' } 
    });

    // ค่าเฉลี่ยความต้านทาน
    const avgResistance = await TestRecord.findOne({
      where: whereClause,
      attributes: [
        [TestRecord.sequelize.fn('AVG', TestRecord.sequelize.col('resistance_value')), 'avg_resistance']
      ],
      raw: true
    });

    res.json({
      total: totalTests,
      pass: passTests,
      fail: failTests,
      pending: pendingTests,
      avgResistance: avgResistance.avg_resistance || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดูข้อมูลการทดสอบล่าสุด
const getLatestTestRecords = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const testRecords = await TestRecord.findAll({
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'full_name']
        }
      ],
      limit: parseInt(limit),
      order: [['test_date', 'DESC']]
    });

    res.json(testRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTestRecord,
  getAllTestRecords,
  getTestRecordById,
  updateTestRecord,
  deleteTestRecord,
  getTestStats,
  getLatestTestRecords
};
