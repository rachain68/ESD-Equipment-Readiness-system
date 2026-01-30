const { TestRecord, Equipment, User } = require('../models')
const { Op } = require('sequelize')

// ดึงข้อมูลบันทึกการทดสอบทั้งหมด
const getAllTestRecords = async (req, res) => {
  try {
    const { search, date, page = 1, limit = 50 } = req.query
    
    const whereClause = {}
    
    // ค้นหาตามชื่ออุปกรณ์, รุ่น, หรือหมายเลขซีเรียล
    if (search) {
      whereClause[Op.or] = [
        { '$equipment.name$': { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } }
      ]
    }
    
    // กรองตามวันที่
    if (date) {
      whereClause.test_date = date
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
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
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['test_date', 'DESC']],
      limit: parseInt(limit),
      offset
    })
    
    res.json({
      test_records: testRecords,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching test records:', error)
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลบันทึกการทดสอบได้' })
  }
}

// ดึงข้อมูลบันทึกการทดสอบตาม ID
const getTestRecordById = async (req, res) => {
  try {
    const { id } = req.params
    
    const testRecord = await TestRecord.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    })
    
    if (!testRecord) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการทดสอบ' })
    }
    
    res.json(testRecord)
  } catch (error) {
    console.error('Error fetching test record:', error)
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลบันทึกการทดสอบได้' })
  }
}

// สร้างบันทึกการทดสอบใหม่
const createTestRecord = async (req, res) => {
  try {
    const {
      equipment_id,
      test_date,
      brand,
      model,
      serial_number,
      calibration_date,
      due_date,
      temperature,
      humidity,
      cal_test,
      cal_first_retest,
      cal_second_retest,
      golden_conductive_test,
      golden_conductive_first_retest,
      golden_conductive_second_retest,
      golden_insulative_test,
      golden_insulative_first_retest,
      golden_insulative_second_retest,
      test_location,
      operator_id
    } = req.body
    
    // ตรวจสอบว่ามีอุปกรณ์นี้อยู่จริง
    const equipment = await Equipment.findByPk(equipment_id)
    if (!equipment) {
      return res.status(400).json({ error: 'ไม่พบอุปกรณ์ที่ระบุ' })
    }
    
    const testRecord = await TestRecord.create({
      equipment_id,
      test_date,
      brand,
      model,
      serial_number,
      calibration_date,
      due_date,
      temperature: temperature ? parseFloat(temperature) : null,
      humidity: humidity ? parseFloat(humidity) : null,
      cal_test: cal_test ? parseFloat(cal_test) : null,
      cal_first_retest: cal_first_retest ? parseFloat(cal_first_retest) : null,
      cal_second_retest: cal_second_retest ? parseFloat(cal_second_retest) : null,
      golden_conductive_test: golden_conductive_test ? parseFloat(golden_conductive_test) : null,
      golden_conductive_first_retest: golden_conductive_first_retest ? parseFloat(golden_conductive_first_retest) : null,
      golden_conductive_second_retest: golden_conductive_second_retest ? parseFloat(golden_conductive_second_retest) : null,
      golden_insulative_test: golden_insulative_test ? parseFloat(golden_insulative_test) : null,
      golden_insulative_first_retest: golden_insulative_first_retest ? parseFloat(golden_insulative_first_retest) : null,
      golden_insulative_second_retest: golden_insulative_second_retest ? parseFloat(golden_insulative_second_retest) : null,
      test_location,
      operator_id
    })
    
    // ดึงข้อมูลที่สร้างขึ้นมาพร้อมความสัมพันธ์
    const newTestRecord = await TestRecord.findByPk(testRecord.id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    })
    
    res.status(201).json(newTestRecord)
  } catch (error) {
    console.error('Error creating test record:', error)
    res.status(500).json({ error: 'ไม่สามารถสร้างบันทึกการทดสอบได้' })
  }
}

// แก้ไขบันทึกการทดสอบ
const updateTestRecord = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    // แปลงค่าตัวเลข
    const numericFields = [
      'temperature', 'humidity', 'cal_test', 'cal_first_retest', 'cal_second_retest',
      'golden_conductive_test', 'golden_conductive_first_retest', 'golden_conductive_second_retest',
      'golden_insulative_test', 'golden_insulative_first_retest', 'golden_insulative_second_retest'
    ]
    
    numericFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] ? parseFloat(updateData[field]) : null
      }
    })
    
    const [updatedRowsCount] = await TestRecord.update(updateData, {
      where: { id }
    })
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการทดสอบ' })
    }
    
    // ดึงข้อมูลที่อัปเดตแล้ว
    const updatedTestRecord = await TestRecord.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'model', 'serial_number']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    })
    
    res.json(updatedTestRecord)
  } catch (error) {
    console.error('Error updating test record:', error)
    res.status(500).json({ error: 'ไม่สามารถแก้ไขบันทึกการทดสอบได้' })
  }
}

// ลบบันทึกการทดสอบ
const deleteTestRecord = async (req, res) => {
  try {
    const { id } = req.params
    
    const deletedRowsCount = await TestRecord.destroy({
      where: { id }
    })
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลบันทึกการทดสอบ' })
    }
    
    res.json({ message: 'ลบบันทึกการทดสอบสำเร็จ' })
  } catch (error) {
    console.error('Error deleting test record:', error)
    res.status(500).json({ error: 'ไม่สามารถลบบันทึกการทดสอบได้' })
  }
}

// ส่งออกข้อมูลเป็น Excel
const exportTestRecords = async (req, res) => {
  try {
    const { startDate, endDate, equipmentId } = req.query
    
    const whereClause = {}
    
    if (startDate && endDate) {
      whereClause.test_date = {
        [Op.between]: [startDate, endDate]
      }
    }
    
    if (equipmentId) {
      whereClause.equipment_id = equipmentId
    }
    
    const testRecords = await TestRecord.findAll({
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
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['test_date', 'DESC']]
    })
    
    // TODO: Implement Excel export logic
    // For now, return JSON data
    res.json({
      message: 'ฟังก์ชันส่งออก Excel จะเพิ่มในภายหลัง',
      data: testRecords
    })
  } catch (error) {
    console.error('Error exporting test records:', error)
    res.status(500).json({ error: 'ไม่สามารถส่งออกข้อมูลได้' })
  }
}

// ดูสถิติการทดสอบ
const getTestStats = async (req, res) => {
  try {
    const { equipment_id, start_date, end_date } = req.query
    
    const whereClause = {}
    if (equipment_id) {
      whereClause.equipment_id = equipment_id
    }
    
    if (start_date || end_date) {
      whereClause.test_date = {}
      if (start_date) {
        whereClause.test_date[Op.gte] = new Date(start_date)
      }
      if (end_date) {
        whereClause.test_date[Op.lte] = new Date(end_date)
      }
    }

    const totalTests = await TestRecord.count({ where: whereClause })
    
    // ใช้ try-catch สำหรับ column ที่อาจไม่มี
    let passTests = 0, failTests = 0, pendingTests = 0
    try {
      passTests = await TestRecord.count({ 
        where: { ...whereClause, test_status: 'pass' } 
      })
      failTests = await TestRecord.count({ 
        where: { ...whereClause, test_status: 'fail' } 
      })
      pendingTests = await TestRecord.count({ 
        where: { ...whereClause, test_status: 'pending' } 
      })
    } catch (e) {
      // ถ้าไม่มี test_status column ให้ถือว่า pending ทั้งหมด
      pendingTests = totalTests
    }

    // ค่าเฉลี่ยความต้านทาน (ใช้ค่าจาก CAL test)
    let avgResistanceValue = 0
    try {
      const avgResistance = await TestRecord.findOne({
        where: whereClause,
        attributes: [
          [TestRecord.sequelize.fn('AVG', TestRecord.sequelize.col('cal_test')), 'avg_resistance']
        ],
        raw: true
      })
      avgResistanceValue = avgResistance?.avg_resistance || 0
    } catch (e) {
      avgResistanceValue = 0
    }

    res.json({
      total: totalTests,
      pass: passTests,
      fail: failTests,
      pending: pendingTests,
      avgResistance: avgResistanceValue
    })
  } catch (error) {
    console.error('Error fetching test stats:', error)
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติการทดสอบได้' })
  }
}

// ดูข้อมูลการทดสอบล่าสุด
const getLatestTestRecords = async (req, res) => {
  try {
    const { limit = 10 } = req.query

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
    })

    res.json(testRecords)
  } catch (error) {
    console.error('Error fetching latest test records:', error)
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการทดสอบล่าสุดได้' })
  }
}

module.exports = {
  getAllTestRecords,
  getTestRecordById,
  createTestRecord,
  updateTestRecord,
  deleteTestRecord,
  getTestStats,
  getLatestTestRecords,
  exportTestRecords
}
